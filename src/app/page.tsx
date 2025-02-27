import Navbar from "@/components/Navbar"; 

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold text-blue-500">Welcome to GoodDeeds! 🚀</h1>
        <p className="text-gray-400 mt-4">Start helping people by completing micro-volunteering tasks!</p>
      </div>
    </main>
  );
}