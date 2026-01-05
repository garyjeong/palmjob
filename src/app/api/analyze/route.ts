import { NextRequest, NextResponse } from "next/server";
import { createAnalysis, updateAnalysisStatus, saveImage } from "@/lib/redis";
import { analyzeImages, getDefaultResult, setAnalysisId } from "@/lib/openai";
import { generateJobImage } from "@/lib/dalle";
import { validatePalmImages } from "@/lib/palmValidation";
import { Gender } from "@/types";

// 고유 ID 생성
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

// 이미지를 Base64로 변환
async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = file.type || "image/jpeg";
  return `data:${mimeType};base64,${base64}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const gender = formData.get("gender") as Gender | null;
    const leftImage = formData.get("leftImage") as File;
    const rightImage = formData.get("rightImage") as File;

    // 유효성 검사 - 성별 필수
    if (!gender || (gender !== "male" && gender !== "female")) {
      return NextResponse.json(
        { error: "성별을 선택해주세요." },
        { status: 400 }
      );
    }

    // 유효성 검사 - 양손 이미지 모두 필요
    if (!leftImage || !(leftImage instanceof File)) {
      return NextResponse.json(
        { error: "왼손 사진을 업로드해주세요." },
        { status: 400 }
      );
    }

    if (!rightImage || !(rightImage instanceof File)) {
      return NextResponse.json(
        { error: "오른손 사진을 업로드해주세요." },
        { status: 400 }
      );
    }

    // 파일 크기 체크 (각 10MB)
    if (leftImage.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "왼손 사진 크기는 10MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    if (rightImage.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "오른손 사진 크기는 10MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    // 이미지 타입 체크
    if (!leftImage.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "왼손 파일은 이미지 형식이어야 합니다." },
        { status: 400 }
      );
    }

    if (!rightImage.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "오른손 파일은 이미지 형식이어야 합니다." },
        { status: 400 }
      );
    }

    // 분석 ID 생성 및 저장
    const id = generateId();
    await createAnalysis(id);

    // 분석 ID를 openai 모듈에 설정 (프롬프트 로그 저장용)
    setAnalysisId(id);

    // 분석 상태를 analyzing으로 업데이트 (진행률 0%로 시작)
    await updateAnalysisStatus(id, "analyzing", undefined, undefined, 0);

    // 비동기로 분석 수행 (백그라운드)
    processAnalysis(id, leftImage, rightImage, gender).catch(console.error);

    // 즉시 ID 반환 (클라이언트는 폴링으로 결과 확인)
    return NextResponse.json({ id, status: "analyzing" });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "분석 요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 백그라운드 분석 처리
async function processAnalysis(
  id: string,
  leftImage: File,
  rightImage: File,
  gender: Gender
) {
  try {
    // 양손 이미지를 Base64로 변환
    const [leftBase64, rightBase64] = await Promise.all([
      fileToBase64(leftImage),
      fileToBase64(rightImage),
    ]);

    // 이미지 저장 (옵션, 환경 변수로 제어)
    if (process.env.ENABLE_IMAGE_STORAGE === "true") {
      await Promise.all([
        saveImage(id, "left", leftBase64),
        saveImage(id, "right", rightBase64),
      ]).catch((err) => {
        console.warn("Failed to save images:", err);
      });
    }

    // 손바닥 검증 단계 (비용 절감을 위해 분석 전에 검증)
    const validation = await validatePalmImages(leftBase64, rightBase64, id);

    if (!validation.isValid) {
      // 검증 실패 시 즉시 종료 (분석 API 호출하지 않음)
      const errorType = validation.errorType || "UNKNOWN";
      const errorMessage = validation.message || "손바닥 이미지 검증에 실패했습니다.";
      
      await updateAnalysisStatus(id, "failed", undefined, errorType, 0);
      console.log(`[Validation Failed] ID: ${id}, ErrorType: ${errorType}, Message: ${errorMessage}`);
      return; // 분석 API 호출하지 않음 (비용 절감)
    }

    // 검증 완료: 30%
    await updateAnalysisStatus(id, "analyzing", undefined, undefined, 30);
    console.log(`[Validation Passed] ID: ${id}, Proceeding to analysis`);

    // 검증 통과 시에만 분석 진행
    const result = await analyzeImages(leftBase64, rightBase64);
    
    // 분석 완료: 70%
    await updateAnalysisStatus(id, "analyzing", undefined, undefined, 70);

    if (result.success && result.job) {
      // DALL-E로 직업 캐릭터 이미지 생성 (선택적, 실패해도 결과에 영향 없음)
      const imageResult = await generateJobImage(result.job.title, gender, id);
      if (imageResult.success && imageResult.imageUrl) {
        result.job.cardImageUrl = imageResult.imageUrl;
        console.log(`Card image generated for: ${result.job.title} (${gender})`);
        
        // 카드 이미지 저장 (OG 이미지에서 필요, DALL-E URL 만료 문제 해결을 위해 항상 저장)
        try {
          // URL에서 이미지 다운로드 및 Base64 변환
          const imageResponse = await fetch(imageResult.imageUrl);
          const imageBuffer = await imageResponse.arrayBuffer();
          const imageBase64 = Buffer.from(imageBuffer).toString("base64");
          const mimeType = imageResponse.headers.get("content-type") || "image/png";
          const imageDataUrl = `data:${mimeType};base64,${imageBase64}`;

          await saveImage(id, "card", imageDataUrl);
        } catch (err) {
          console.warn("Failed to save card image:", err);
        }
      } else {
        console.warn("Card image generation failed, using emoji fallback");
      }

      // DALL-E 완료: 100% (성공 여부와 관계없이)
      // 성공: 결과 저장
      await updateAnalysisStatus(id, "completed", result.job, undefined, 100);
    } else {
      // 실패: 기본 결과로 대체 (100%로 설정)
      console.warn("Using default result due to:", result.error);
      const defaultJob = getDefaultResult();
      await updateAnalysisStatus(id, "completed", defaultJob, undefined, 100);
    }
  } catch (error) {
    console.error("Process analysis error:", error);
    // 에러 시에도 기본 결과 제공 (100%로 설정)
    const defaultJob = getDefaultResult();
    await updateAnalysisStatus(id, "completed", defaultJob, undefined, 100);
  }
}
