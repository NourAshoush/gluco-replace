import { MdBlock } from "react-icons/md";

export default function Unauthorised() {
    return (
        <main className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <MdBlock className="mx-auto text-red-600 text-6xl mb-4" />
                <h1 className="text-4xl font-bold text-red-600">Unauthorized</h1>
                <p className="mt-4 text-lg text-gray-700">
                    You do not have permission to access this page.
                </p>
            </div>
        </main>
    );
}