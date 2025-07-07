import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

export default function Footer() {
    const { language, setLanguage } = useLanguage();
    const isArabic = language === "ar";
    return (
        <footer className="bg-white mt-12 py-6 px-4 shadow-md rounded-t-md border border-gray-200">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-center gap-15 text-center md:text-left">
                <div className="flex-shrink-0">
                    <Image
                        src="/ccc_logo.jpeg"
                        alt="Company Logo"
                        width={200}
                        height={200}
                        className="mx-auto md:mx-0"
                        draggable={false}
                    />
                </div>
                <div className="text-sm text-gray-700">
                    <p>
                        <strong>{isArabic ? "العنوان:" : "Address:"}</strong><br />
                        {isArabic
                            ? "برج الحمراء للأعمال، الطابق 69، شارع الشهداء، شرق، الكويت"
                            : "Al Hamra Business Tower, 69th Floor, Al Shuhada Street, Sharq, Kuwait"}
                    </p>
                    <p className="mt-2">
                        <strong>{isArabic ? "رقم الهاتف:" : "Phone:"}</strong><br />
                        <a href="tel:+9651869869" className="text-inherit no-underline">
                            (+965) 1869869
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}