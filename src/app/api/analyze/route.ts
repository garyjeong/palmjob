import { NextRequest, NextResponse } from "next/server";
import { createAnalysis, updateAnalysisStatus } from "@/lib/redis";
import { analyzeImages, getDefaultResult } from "@/lib/openai";
import { generateJobImage } from "@/lib/dalle";

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
    const leftImage = formData.get("leftImage") as File;
    const rightImage = formData.get("rightImage") as File;

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

    // 분석 상태를 analyzing으로 업데이트
    await updateAnalysisStatus(id, "analyzing");

    // 비동기로 분석 수행 (백그라운드)
    processAnalysis(id, leftImage, rightImage).catch(console.error);

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
async function processAnalysis(id: string, leftImage: File, rightImage: File) {
  try {
    // 양손 이미지를 Base64로 변환
    const [leftBase64, rightBase64] = await Promise.all([
      fileToBase64(leftImage),
      fileToBase64(rightImage),
    ]);

    // OpenAI Vision API로 양손 분석
    const result = await analyzeImages(leftBase64, rightBase64);

    if (result.success && result.job) {
      // DALL-E로 직업 캐릭터 이미지 생성 (선택적, 실패해도 결과에 영향 없음)
      const imageResult = await generateJobImage(result.job.title);
      if (imageResult.success && imageResult.imageUrl) {
        result.job.cardImageUrl = imageResult.imageUrl;
        console.log(`Card image generated for: ${result.job.title}`);
      } else {
        console.warn("Card image generation failed, using emoji fallback");
      }

      // 성공: 결과 저장
      await updateAnalysisStatus(id, "completed", result.job);
    } else {
      // 실패: 기본 결과로 대체
      console.warn("Using default result due to:", result.error);
      const defaultJob = getDefaultResult();
      await updateAnalysisStatus(id, "completed", defaultJob);
    }
  } catch (error) {
    console.error("Process analysis error:", error);
    // 에러 시에도 기본 결과 제공
    const defaultJob = getDefaultResult();
    await updateAnalysisStatus(id, "completed", defaultJob);
  }
}
