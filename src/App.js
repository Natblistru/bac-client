import React, { useState } from "react";
import ResizableSplit from "./components/ResizableSplit";
import "./App.css";

const questions = [
  {
    no: 47,
    prompt:
      "Keep your final objective in mind when you are planning to change jobs.",
  },
  {
    no: 48,
    prompt:
      "It takes time to become familiar with the characteristics of a company you have joined.",
  },
  {
    no: 49,
    prompt:
      "You should demonstrate determination to improve your job prospects.",
  },
  {
    no: 50,
    prompt: "Make sure your approach for information is positive in tone.",
  },
  {
    no: 51,
    prompt:
      "It is not certain that you will be given very much support in your job initially.",
  },
  { no: 52, prompt: "Stay optimistic in spite of setbacks." },
  {
    no: 53,
    prompt: "Promotion isn’t the only way to increase your expertise.",
  },
  { no: 54, prompt: "Ask for information about your shortcomings." },
  {
    no: 55,
    prompt: "Some information you are given may not give a complete picture.",
  },
  {
    no: 56,
    prompt:
      "It will be some time before you start giving your employers their money’s worth.",
  },
];

const letters = ["A", "B", "C", "D", "E"];

export default function App() {
  const [answers, setAnswers] = useState({});

  const handlePick = (qNo, letter) =>
    setAnswers((prev) => ({ ...prev, [qNo]: letter }));

  const done = Object.keys(answers).length;

  return (
    <div className="app">
      <header className="topbar">
        <h1>Sesiunea de baza - Limba si literatura română, 2025</h1>
        <div className="progress">
          Answered: {done}/{questions.length}
        </div>
      </header>

      <ResizableSplit initial={50} minLeft={300} minRight={360}>
        {/* Stânga: articolul cu consultanți */}
        <section className="left reading">
          <h2>Citește textul propus și realizează itemii:</h2>

          <p className="indent">
          <span className="u"> Primii ani de după război au fost grei... Îmi petreceam timpul liber 
             <b> citind</b>, iar interesul pentru astronomie,
            fizică și matematică deviase într-o obsesie cronică, așa încât pot
            zice că mi-am trăit adolescența într-o lume de cifre, legi și
            formule. Am continuat să învăț la un liceu german, chiar dacă
            însușisem româna într-atât de temeinic, încât doar cei cu urechea
            prea fină își dădeau seama că nu sunt român. Eram de departe cel mai
            bun elev din clasă la toate limbile, însă patima mea erau științele
            reale. </span>Visam să devin un mare matematician, dar tata, căruia îi mai
            ofeream uneori niște crâmpeie din visurile mele, se uita la mine cu
            milă.
          </p>

          <p className="indent">
            – Ai să mori de foame cu linii și cifre, băiatule. Gândește-te și tu
            la o<b> școală</b> ceva mai ca lumea și nici
            n-are rost să te duci pentru învățătură tocmai la capătul
            pământului. O să-ți spun un lucru: contează cine învață, nu unde. E
            foarte bună și universitatea noastră. Rămâi acasă, lângă noi, nu
            duci lipsă de nimic.
          </p>

          <p className="indent">
            Apoi adăugă cu oarecare îndoială:
          </p>
          <p className="indent">
           – Între timp te mai deprinzi și cu
            gospodăria. Eu, mâine-poimâine, ies din luptă. Se cuvine să
            moștenești tu afacerile. Până faci facultatea, găsești și-o fată
            bună... Trebuie și asta.
          </p>

          <p className="indent">
            Era măcinat de niște simțăminte amestecate: pe de o parte, voia
            să-mi fie bine, să fiu îndestulat, iar pe de alta, se despărțea
            întotdeauna cu durere de roadele muncii lui. Pe noi ne asigura cu
            tot de ce era nevoie, dar cu măsură, fără excese. „Nimic nu corupe
            mai tare un suflet fraged decât banii”, îi plăcea să ne zică. […]
          </p>

          <p className="indent">
            Ajuns la Viena, i-am trimis o telegramă profesorului Hilbert, la
            Göttingen, pentru a mă asigura că-mi poate fixa o întrevedere. Mi-a
            răspuns două zile mai târziu, confirmându-mi faptul că mă așteaptă.
            […]
          </p>

          <p className="indent">
            Pentru un viitor matematician, întâlnirea cu Hilbert era ceea ce
            pentru un pianist începător ar fi fost un contact direct cu
            Beethoven: era întâlnirea cu „instanța supremă”. Când am ajuns în fața
            ușii, pe care era gravat, pe o placă de bronz, numele ilustrului
            matematician,
            <b> inima</b> mi se zbătea ca peștele în năvod.
          </p>

          <p className="indent">
            Amețisem de emoții când am deschis ușa, avansând în acel birou
            sobru, imens, cu tavan înalt. Aveam în față o zeitate academică
            dezarmant de umană. Mi-a dat mai multe sfaturi practice și nume de
            persoane care-mi puteau fi de folos, după care am convenit să ne
            vedem peste câteva zile pentru o discuție mai consistentă.
          </p>

          <p className="indent">
            Am ieșit din Institutul de matematică cu o inimă care pulsa ca un
            vulcan. Acum pășeam cu încredere pe străzile renumitei urbe
            universitare, citind la fiecare colț plăcuțele comemorative cu nume
            de somități care activaseră ori studiaseră aici cândva. „Va veni
            numaidecât o zi când pe una dintre aceste case va fi și o tăbliță cu
            numele meu!” Eram optimist.
          </p>

          <p className="source">
            (Oleg Serebrian. <em>Pe contrasens</em>)
          </p>
        </section>

        {/* Dreapta: întrebările 47–56 */}
        <aside className="right">
          {questions.map((q) => (
            <div className="question" key={q.no}>
              <div className="q-head">
                <span className="q-no">{q.no}</span>
                <p className="q-text">{q.prompt}</p>
              </div>

              <div className="choices">
                {letters.map((L) => (
                  <label key={L} className="choice">
                    <input
                      type="radio"
                      name={`q-${q.no}`}
                      value={L}
                      checked={answers[q.no] === L}
                      onChange={() => handlePick(q.no, L)}
                    />
                    <span>Consultant {L}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </ResizableSplit>
    </div>
  );
}
