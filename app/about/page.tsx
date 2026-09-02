import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos | Savora",
  description: "Découvrez la mission de Savora : simplifier la découverte et la réservation de tables dans les meilleurs restaurants.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* HERO */}
      <section className="bg-gradient-to-b from-[#800020] to-[#500014] text-white">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center md:py-32">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">
            À propos de Savora
          </p>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            La prochaine table
            <br />
            commence ici.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/80">
            Savora facilite la découverte des restaurants et la réservation
            de tables, pour offrir une expérience simple, moderne et accessible.
          </p>

        </div>
      </section>


      {/* NOTRE MISSION */}
      <section className="mx-auto max-w-6xl px-6 py-20">

        <div className="grid gap-12 md:grid-cols-2 md:items-center">

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#800020]">
              Notre mission
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Reconnecter les restaurants et leurs clients.
            </h2>
          </div>

          <div className="space-y-5 text-gray-600 leading-8">
            <p>
              Trouver un bon restaurant ne devrait pas être compliqué.
              Savora rassemble les établissements partenaires dans une
              expérience simple et intuitive.
            </p>

            <p>
              Notre objectif est d'aider les clients à découvrir de nouveaux
              endroits, consulter leurs informations et réserver leur table
              en quelques secondes.
            </p>
          </div>

        </div>

      </section>


      {/* COMMENT ÇA MARCHE */}
      <section className="bg-[#800020]/5 border-y border-[#800020]/10">

        <div className="mx-auto max-w-6xl px-6 py-20">

          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#800020]">
              L'expérience Savora
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Simple pour les clients.
              <br />
              Puissant pour les restaurants.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <div className="rounded-3xl bg-white p-8 border border-[#800020]/10 shadow-sm transition hover:shadow-md">
              <div className="text-4xl" aria-hidden="true">🔎</div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">
                Découvrez
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Explorez les restaurants disponibles et trouvez celui
                qui correspond à votre envie.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 border border-[#800020]/10 shadow-sm transition hover:shadow-md">
              <div className="text-4xl" aria-hidden="true">📅</div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">
                Réservez
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Choisissez votre date, votre heure et le nombre de personnes.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 border border-[#800020]/10 shadow-sm transition hover:shadow-md">
              <div className="text-4xl" aria-hidden="true">🍽️</div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">
                Savourez
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Présentez-vous au restaurant et profitez pleinement
                de votre expérience.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* POUR LES RESTAURANTS */}
      <section className="mx-auto max-w-6xl px-6 py-20">

        <div className="rounded-[2rem] bg-gradient-to-r from-[#800020] to-[#500014] p-8 text-white md:p-14 shadow-xl flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">

          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
              Pour les restaurants
            </p>

            <h2 className="mt-4 text-3xl font-black md:text-4xl">
              Donnez à votre restaurant la visibilité qu'il mérite.
            </h2>

            <p className="mt-4 leading-relaxed text-white/80">
              Présentez votre établissement, recevez des réservations
              et développez votre présence numérique avec Savora.
            </p>
          </div>

          <Link
            href="/contact-partenaire"
            className="shrink-0 rounded-full bg-white px-8 py-4 font-bold text-[#800020] shadow-lg transition hover:bg-gray-100 hover:scale-105 active:scale-95"
          >
            Devenir partenaire
          </Link>

        </div>

      </section>


      {/* CTA */}
      <section className="border-t border-gray-100">

        <div className="mx-auto max-w-4xl px-6 py-20 text-center">

          <h2 className="text-3xl font-black text-gray-900 md:text-5xl">
            Prêt à découvrir Savora ?
          </h2>

          <p className="mt-4 text-gray-500">
            Trouvez votre prochaine expérience culinaire.
          </p>

          <Link
            href="/restaurants"
            className="mt-8 inline-block rounded-full bg-[#800020] px-8 py-4 font-semibold text-white shadow-md transition hover:bg-[#600018] hover:scale-105"
          >
            Découvrir les restaurants
          </Link>

        </div>

      </section>

    </main>
  );
}