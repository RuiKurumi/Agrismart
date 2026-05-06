import { NextRequest, NextResponse } from 'next/server';

function getGrowthStage(dap: number) {
  if (dap <= 14) return 'Germination';
  if (dap <= 30) return 'Seedling';
  if (dap <= 60) return 'Vegetative';
  if (dap <= 90) return 'Bulbing';
  if (dap <= 110) return 'Maturation';
  return 'Ready for Harvest';
}

export async function GET(req: NextRequest) {
  try {
    const plantingDateStr = req.nextUrl.searchParams.get('plantingDate');

    if (!plantingDateStr) {
      return NextResponse.json(
        { error: 'plantingDate is required' },
        { status: 400 }
      );
    }

    const plantingDate = new Date(plantingDateStr);
    const now = new Date();

    const dap = Math.floor(
      (now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (isNaN(dap)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const stage = getGrowthStage(dap);
    const progress = Math.min(Math.max(dap / 110, 0), 1);

    return NextResponse.json({
      plantingDate,
      daysAfterPlanting: dap,
      stage,
      progress,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to calculate growth stage' },
      { status: 500 }
    );
  }
}