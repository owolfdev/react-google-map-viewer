import GoogleMap from "@/components/maps/google-map";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full ">
        <GoogleMap />
      </div>
      <div>
        <Link
          href="https://github.com/owolfdev/react-google-map-viewer"
          target="_blank"
        >
          Source Code on Github
        </Link>
      </div>
    </main>
  );
}
