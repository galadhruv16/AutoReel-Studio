import { NextResponse } from 'next/server';
import { listProjects, saveProject } from '@/lib/server/projectStore';
import { StudioProject } from '@/types/studio';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error: any) {
    console.error('Error listing projects:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project } = body as { project: StudioProject };

    if (!project || !project.id) {
      return NextResponse.json(
        { success: false, error: 'Valid project object with id is required' },
        { status: 400 }
      );
    }

    const saved = await saveProject(project);

    return NextResponse.json({
      success: true,
      project: saved,
      message: 'Project saved successfully to persistent library',
    });
  } catch (error: any) {
    console.error('Error saving project:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save project' },
      { status: 500 }
    );
  }
}
