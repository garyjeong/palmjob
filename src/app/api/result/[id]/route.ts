import { NextRequest, NextResponse } from "next/server";
import { getAnalysis } from "@/lib/redis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "결과 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const result = await getAnalysis(id);

    if (!result) {
      return NextResponse.json(
        { error: "결과를 찾을 수 없거나 만료되었습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Result API error:", error);
    return NextResponse.json(
      { error: "결과 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

