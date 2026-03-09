import Link from "next/link";
import React from "react";

export function DarseQuranBanner() {
    return (
        <section className="w-full">
            <Link href="/darse-quran" className="block w-full cursor-pointer pb-8">
                <div className="relative w-full aspect-[1920/400] overflow-hidden bg-primary/5 flex justify-center border-b-[8px] border-primary">
                    <img
                        src="https://www.tanzeem.org/wp-content/uploads/2026/02/dorae-tarjumae-quran-scaled.webp"
                        alt="Dora-e-Turjuma-e-Quran"
                        className="w-full h-full object-cover"
                    />
                </div>
            </Link>
        </section>
    );
}
