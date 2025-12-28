return NextResponse.json({
  ok: true,
  project: {
    id: projectId,
    projectId,
    name,
    createdAt,
  },
});
