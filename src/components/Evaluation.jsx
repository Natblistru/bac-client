import React, { useState, useEffect } from "react";
import api, { bootCsrf } from '../routes/api';
import { useParams } from "react-router-dom";
import ResizableSplit from "./ResizableSplit";
import "../App.css";

const questions = [
  {
    no: 1,
    prompt: (
      <>
        <p style={{ lineHeight: 1.6 }}>
          Rescrie, din lista propusă, un sinonim contextual adecvat pentru
          lexemul{" "}
          <em>
            <b>interes </b>
            (Îmi petreceam timpul liber citind, iar interesul pentru astronomie,
            fizică și matematică deviase într-o obsesie cronică, ...),
          </em>{" "}
          argumentându-ți alegerea într-un enunț.
        </p>
        <p className="indent">
          <em>
            Preocupare, avantaj, înclinație, grijă, atracție, câștig,
            curiozitate, beneficiu.
          </em>
        </p>
      </>
    ),
  },
  {
    no: 2,
    prompt:
      "It takes time to become familiar with the characteristics of a company you have joined.",
  },
  {
    no: 3,
    prompt:
      "You should demonstrate determination to improve your job prospects.",
  },
  {
    no: 4,
    prompt: "Make sure your approach for information is positive in tone.",
  },
  {
    no: 5,
    prompt:
      "It is not certain that you will be given very much support in your job initially.",
  },
  { no: 6, prompt: "Stay optimistic in spite of setbacks." },
  {
    no: 7,
    prompt: "Promotion isn’t the only way to increase your expertise.",
  },
  { no: 8, prompt: "Ask for information about your shortcomings." },
  {
    no: 9,
    prompt: "Some information you are given may not give a complete picture.",
  },
];

const questions1 = [
  {
    no: 1,
    prompt: (
      <>
        <p style={{ lineHeight: 1.6 }}>
          Rescrie, din lista propusă, un sinonim contextual adecvat pentru
          lexemul{" "}
          <em>
            <b>interes </b>
            (Îmi petreceam timpul liber citind, iar interesul pentru astronomie,
            fizică și matematică deviase într-o obsesie cronică, ...),
          </em>{" "}
          argumentându-ți alegerea într-un enunț.
        </p>
        <p className="indent">
          <em>
            Preocupare, avantaj, înclinație, grijă, atracție, câștig,
            curiozitate, beneficiu.
          </em>
        </p>
      </>
    ),
  }
];

const questions2 = [
  {
    no: 2,
    prompt: (
      <>
        <p style={{ lineHeight: 1.6 }}>
          Alcătuiește câte un enunț, ilustrând sensuri figurate ale cuvintelor:<b> școală, a citi, inimă.</b>
        </p>
      </>
    ),
  }
];
const questions3 = [  
  {
    no: 3,
    prompt: (
      <>
        <p style={{ lineHeight: 1.6 }}>
        Identifică tipul uman reprezentat de personajul-narator, susținându-ți afirmația cu două
        citate din fragment, comentate în câte un enunț.
        </p>
      </>
    ),
  }
];
const questions4 = [  
  {
    no: 4,
    prompt: (
      <>
        <p style={{ lineHeight: 1.6 }}>
        Comentează, în text coerent de 6-7 rânduri, sugestia unei figuri de stil din fragmentul subliniat. (Rescrie și numește figura de stil.)
        </p>
      </>
    ),
  }
];
const questions5 = [ 
  {
    no: 5,
    prompt: (
      <>
        <p style={{ lineHeight: 1.6 }}>
        Schițează, în text coerent de 7-8 rânduri, portretul moral al <b>tatălui</b>, numind două
        trăsături, susținute cu exemple din fragmentul analizat.
        </p>
      </>
    ),
  }
];
const questions6 = [   
  { no: 6, 
    prompt: (
      <>
        <p style={{ lineHeight: 1.6 }}>
        Analizează, în spațiul rezervat, motivul literar al <b>pasiunii pentru cunoaștere</b> în textul dat, în raport cu același motiv dintr-un alt text din literatura română (numește textul și autorul, citează/prezintă o situație din textul ales).
        </p>
      </>
    ),
 }
];
const questions7 = [ 
  {
    no: 7,
    prompt: (
      <>
        <p style={{ lineHeight: 1.6 }}>
        Determină, în text coerent de 5-6 rânduri, atitudinea personajului-narator față de profesorul Hilbert, angajând două citate din fragmentul propus.
        </p>
      </>
    ),
  }
];
const questions8 = [   

  { no: 8, 
    prompt: (
      <>
        <p style={{ lineHeight: 1.6 }}>
        Interpretează, în spațiul rezervat, valoarea stilistică a punctelor de suspensie din
        secvența propusă:
        </p>
        <p style={{ lineHeight: 1.6 }}>
          <em>
          – Între timp te mai deprinzi și cu gospodăria. Eu, mâine-poimâine, ies din luptă. Se cuvine să moștenești tu afacerile. Până faci facultatea, găsești și-o fată bună... Trebuie și asta.
          </em>
        </p>
      </>
    ),
  }
];
const questions9 = [    
  {
    no: 9,
    prompt: (
      <>
        <p style={{ lineHeight: 1.6 }}>
        Prezintă două argumente, ilustrate cu câte o secvenţă din text, care califică fragmentul dat ca pe o naraţiune.
        </p>
      </>
    ),
  },
];

const letters = ["A", "B", "C", "D", "E"];

export default function Evaluation() {
  const [answers, setAnswers] = useState({});

  const { id } = useParams();
  const [row, setRow] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/api/evaluations/${id}`);
      setRow(data);
    })();
  }, [id]);




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
            <span className="u">
              {" "}
              Primii ani de după război au fost grei... Îmi petreceam timpul
              liber
              <b> citind</b>, iar interesul pentru astronomie, fizică și
              matematică deviase într-o obsesie cronică, așa încât pot zice că
              mi-am trăit adolescența într-o lume de cifre, legi și formule. Am
              continuat să învăț la un liceu german, chiar dacă însușisem româna
              într-atât de temeinic, încât doar cei cu urechea prea fină își
              dădeau seama că nu sunt român. Eram de departe cel mai bun elev
              din clasă la toate limbile, însă patima mea erau științele reale.{" "}
            </span>
            Visam să devin un mare matematician, dar tata, căruia îi mai ofeream
            uneori niște crâmpeie din visurile mele, se uita la mine cu milă.
          </p>

          <p className="indent">
            – Ai să mori de foame cu linii și cifre, băiatule. Gândește-te și tu
            la o<b> școală</b> ceva mai ca lumea și nici n-are rost să te duci
            pentru învățătură tocmai la capătul pământului. O să-ți spun un
            lucru: contează cine învață, nu unde. E foarte bună și universitatea
            noastră. Rămâi acasă, lângă noi, nu duci lipsă de nimic.
          </p>

          <p className="indent">Apoi adăugă cu oarecare îndoială:</p>
          <p className="indent">
            – Între timp te mai deprinzi și cu gospodăria. Eu, mâine-poimâine,
            ies din luptă. Se cuvine să moștenești tu afacerile. Până faci
            facultatea, găsești și-o fată bună... Trebuie și asta.
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
            Beethoven: era întâlnirea cu „instanța supremă”. Când am ajuns în
            fața ușii, pe care era gravat, pe o placă de bronz, numele
            ilustrului matematician,
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
          {questions1.map((q) => (
            <div className="question" key={q.no}>
              <div className="q-head">
                <span className="q-no">{q.no}</span>
                <p className="q-text">{q.prompt}</p>
              </div>

              <div className="free-answer">
                <div className="field-row">
                  <label htmlFor={`syn-${q.no}`}>Sinonimul ales</label>
                  <input
                    id={`syn-${q.no}`}
                    type="text"
                    value={answers[q.no]?.synonym || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.no]: {
                          ...(prev[q.no] || {}),
                          synonym: e.target.value,
                        },
                      }))
                    }
                    placeholder="scrie sinonimul aici…"
                  />
                </div>

                <div className="field-col">
                  <label htmlFor={`arg-${q.no}`}>Argumentarea</label>
                  <textarea
                    id={`arg-${q.no}`}
                    rows={4}
                    className="lined"
                    style = {{height: 104 }}  // 4 * 26
                    maxLength={280} // limita de 280 caractere
                    value={answers[q.no]?.argument ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 280); // protecție suplimentară
                      setAnswers((prev) => ({
                        ...prev,
                        [q.no]: { ...(prev[q.no] || {}), argument: v },
                      }));
                    }}
                  />
                  <div className="char-count">
                    {answers[q.no]?.argument?.length ?? 0}/280
                  </div>
                </div>
              </div>
            </div>
          ))}
          {questions2.map((q) => (
            <div className="question" key={q.no}>
              <div className="q-head">
                <span className="q-no">{q.no}</span>
                <p className="q-text">{q.prompt}</p>
              </div> 

              <div className="free-answer">
                <div className="field-col">
                  <textarea
                    id={`arg-${q.no}`}
                    rows={6}
                    className="lined"
                    style = {{height: 156 }}        // 6 * 26px
                    maxLength={380} // limita de380 caractere
                    value={answers[q.no]?.argument ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 380); // protecție suplimentară
                      setAnswers((prev) => ({
                        ...prev,
                        [q.no]: { ...(prev[q.no] || {}), argument: v },
                      }));
                    }}
                  />
                  <div className="char-count">
                    {answers[q.no]?.argument?.length ?? 0}/380
                  </div>
                </div>
              </div>
            </div>
          ))}
          {questions3.map((q) => (
            <div className="question" key={q.no}>
              <div className="q-head">
                <span className="q-no">{q.no}</span>
                <p className="q-text">{q.prompt}</p>
              </div>

              <div className="free-answer">
                <div className="field-row">
                  <label htmlFor={`syn-${q.no}`}>Tipul uman</label>
                  <input
                    id={`syn-${q.no}`}
                    type="text"
                    value={answers[q.no]?.synonym || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.no]: {
                          ...(prev[q.no] || {}),
                          synonym: e.target.value,
                        },
                      }))
                    }
                    placeholder="scrie tipul aici…"
                  />
                </div>

                <div className="field-col">
                  <label htmlFor={`arg-${q.no}`}>Citate şi comentarii</label>
                  <textarea
                    id={`arg-${q.no}`}
                    rows={7}
                    className="lined"
                    style = {{height: 182 }}  // 7 * 26
                    maxLength={580} // limita de 580 caractere
                    value={answers[q.no]?.argument ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 580); // protecție suplimentară
                      setAnswers((prev) => ({
                        ...prev,
                        [q.no]: { ...(prev[q.no] || {}), argument: v },
                      }));
                    }}
                  />
                  <div className="char-count">
                    {answers[q.no]?.argument?.length ?? 0}/580
                  </div>
                </div>
              </div>
            </div>
          ))}
          {questions4.map((q) => (
            <div className="question" key={q.no}>
              <div className="q-head">
                <span className="q-no">{q.no}</span>
                <p className="q-text">{q.prompt}</p>
              </div>

              <div className="free-answer">
                <div className="field-row">
                  <label htmlFor={`syn-${q.no}`}>Figura de stil</label>
                  <input
                    id={`syn-${q.no}`}
                    type="text"
                    value={answers[q.no]?.synonym || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.no]: {
                          ...(prev[q.no] || {}),
                          synonym: e.target.value,
                        },
                      }))
                    }
                    placeholder="scrie figura de stil aici…"
                  />
                </div>

                <div className="field-col">
                  <label htmlFor={`arg-${q.no}`}>Comentariul</label>
                  <textarea
                    id={`arg-${q.no}`}
                    rows={7}
                    className="lined"
                    style = {{height: 182 }}  // 7 * 26
                    maxLength={580} // limita de 580 caractere
                    value={answers[q.no]?.argument ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 580); // protecție suplimentară
                      setAnswers((prev) => ({
                        ...prev,
                        [q.no]: { ...(prev[q.no] || {}), argument: v },
                      }));
                    }}
                  />
                  <div className="char-count">
                    {answers[q.no]?.argument?.length ?? 0}/580
                  </div>
                </div>
              </div>
            </div>
          ))}
          {questions5.map((q) => (
            <div className="question" key={q.no}>
              <div className="q-head">
                <span className="q-no">{q.no}</span>
                <p className="q-text">{q.prompt}</p>
              </div> 

              <div className="free-answer">
                <div className="field-col">
                  <textarea
                    id={`arg-${q.no}`}
                    rows={8}
                    className="lined"
                    style = {{height: 208 }}        // 8 * 26px
                    maxLength={680} // limita de680 caractere
                    value={answers[q.no]?.argument ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 680); // protecție suplimentară
                      setAnswers((prev) => ({
                        ...prev,
                        [q.no]: { ...(prev[q.no] || {}), argument: v },
                      }));
                    }}
                  />
                  <div className="char-count">
                    {answers[q.no]?.argument?.length ?? 0}/680
                  </div>
                </div>
              </div>
            </div>
          ))}
          {questions6.map((q) => (
            <div className="question" key={q.no}>
              <div className="q-head">
                <span className="q-no">{q.no}</span>
                <p className="q-text">{q.prompt}</p>
              </div> 

              <div className="free-answer">
                <div className="field-col">
                  <textarea
                    id={`arg-${q.no}`}
                    rows={14}
                    className="lined"
                    style = {{height: 364 }}        // 14 * 26px
                    maxLength={1680} // limita de1680 caractere
                    value={answers[q.no]?.argument ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 1680); // protecție suplimentară
                      setAnswers((prev) => ({
                        ...prev,
                        [q.no]: { ...(prev[q.no] || {}), argument: v },
                      }));
                    }}
                  />
                  <div className="char-count">
                    {answers[q.no]?.argument?.length ?? 0}/1680
                  </div>
                </div>
              </div>
            </div>
          ))}
          {questions7.map((q) => (
            <div className="question" key={q.no}>
              <div className="q-head">
                <span className="q-no">{q.no}</span>
                <p className="q-text">{q.prompt}</p>
              </div> 

              <div className="free-answer">
                <div className="field-col">
                  <textarea
                    id={`arg-${q.no}`}
                    rows={6}
                    className="lined"
                    style = {{height: 156 }}        // 6 * 26px
                    maxLength={680} // limita de 680 caractere
                    value={answers[q.no]?.argument ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 680); // protecție suplimentară
                      setAnswers((prev) => ({
                        ...prev,
                        [q.no]: { ...(prev[q.no] || {}), argument: v },
                      }));
                    }}
                  />
                  <div className="char-count">
                    {answers[q.no]?.argument?.length ?? 0}/680
                  </div>
                </div>
              </div>
            </div>
          ))}
          {questions8.map((q) => (
            <div className="question" key={q.no}>
              <div className="q-head">
                <span className="q-no">{q.no}</span>
                <p className="q-text">{q.prompt}</p>
              </div> 

              <div className="free-answer">
                <div className="field-col">
                  <textarea
                    id={`arg-${q.no}`}
                    rows={7}
                    className="lined"
                    style = {{height: 182 }}        // 7 * 26px
                    maxLength={680} // limita de 680 caractere
                    value={answers[q.no]?.argument ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 680); // protecție suplimentară
                      setAnswers((prev) => ({
                        ...prev,
                        [q.no]: { ...(prev[q.no] || {}), argument: v },
                      }));
                    }}
                  />
                  <div className="char-count">
                    {answers[q.no]?.argument?.length ?? 0}/680
                  </div>
                </div>
              </div>
            </div>
          ))}
          {questions9.map((q) => (
            <div className="question" key={q.no}>
              <div className="q-head">
                <span className="q-no">{q.no}</span>
                <p className="q-text">{q.prompt}</p>
              </div>

              <div className="free-answer">
                {/* ARGUMENTUL 1 */}
                <div className="field-col">
                  <label htmlFor={`arg1-${q.no}`}>Argumentul 1</label>
                  <textarea
                    id={`arg1-${q.no}`}
                    rows={7}
                    className="lined"
                    style={{ height: 182 }}                // 7 * 26 
                    maxLength={580}
                    value={answers[q.no]?.argument1 ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 580);
                      setAnswers((prev) => ({
                        ...prev,
                        [q.no]: { ...(prev[q.no] || {}), argument1: v },
                      }));
                    }}
                  />
                  <div className="char-count">
                    {(answers[q.no]?.argument1?.length ?? 0)}/580
                  </div>
                </div>

                {/* ARGUMENTUL 2 */}
                <div className="field-col">
                  <label htmlFor={`arg2-${q.no}`}>Argumentul 2</label>
                  <textarea
                    id={`arg2-${q.no}`}
                    rows={7}
                    className="lined"
                    style={{ height: 182 }}                //* 7 * 26 *
                    maxLength={580}
                    value={answers[q.no]?.argument2 ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 580);
                      setAnswers((prev) => ({
                        ...prev,
                        [q.no]: { ...(prev[q.no] || {}), argument2: v },
                      }));
                    }}
                  />
                  <div className="char-count">
                    {(answers[q.no]?.argument2?.length ?? 0)}/580
                  </div>
                </div>
              </div>
            </div>
          ))}


        </aside>
      </ResizableSplit>
    </div>
  );
}
