import GoogleMap from "@/components/maps/google-map";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full ">
        <GoogleMap />
      </div>
    </main>
  );
}
