export const runtime = "nodejs";

export async function POST() {
  try {
  

    return Response.json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (err) {
    console.error("Logout error:", err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
