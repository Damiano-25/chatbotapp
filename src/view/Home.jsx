"use client";

import InputArea from "@/components/ui/InputArea"
import ResponseArea from "@/components/ui/ResponseArea"
import BottoneRimuoviCronologia from "@/components/ui/BottoneRimuoviCronologia";

import { useRef, useState, useEffect } from "react";
import Bottone from "@/components/ui/Bottone";
import BottoneNuovaChat from "@/components/ui/BottoneNuovaChat"
import ChatContainer from "@/components/ui/ChatContainer"
import stringSimilarity from 'string-similarity';
import { RefreshCw } from 'lucide-react';
import { Trash } from 'lucide-react';
import { CirclePlus } from 'lucide-react';

//chiave api (openrouter)
const API_KEY = "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";
const API_KEY_METEO = "c59cd46ce5260fe18e994f7163aad404";

export default function HomePage() {
  const [input, setInput] = useState(""); //input utente
  const [listaRisposte, setlistaRisposte] = useState([]); //risposte ai
  const responseRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  //----------scroll quando mandato nuovo messaggio----------
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [listaRisposte]);

  //---------------------------------------------------------

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("chatRisposte", JSON.stringify(listaRisposte));
    }
  }, [listaRisposte, isLoaded])

  useEffect(() => {
    const datiSalvati = localStorage.getItem("chatRisposte");
    if (datiSalvati) {
      setlistaRisposte(JSON.parse(datiSalvati));
    }

    setIsLoaded(true);
  }, []) //[] --> esegue solo una volta

  useEffect(() => {
    const datiSalvati = localStorage.getItem("chatRisposte");
    const cronologia = localStorage.getItem("chatHistory");

    if (datiSalvati) {
      setlistaRisposte(JSON.parse(datiSalvati));
    }

    if (cronologia) {
      setChatHistory(JSON.parse(cronologia));
    }

    setIsLoaded(true);
  }, []);

  //creo metodo per invio richiesra a AI
  const sendMessage = async () => {
    const MODELLO = "mistralai/mistral-7b-instruct"; //modello
    const nuovalistaRisposte = [...listaRisposte, { role: "user", content: input }] //lista risposte AI

    const inputCorretto = await correggiTesto(input);

    //controllo se richiesta meteo
    if (isMeteoRequest(inputCorretto)) {
      const citta = estraiCitta(input) || "Arezzo"; //arezzo default

      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${citta}&appid=${API_KEY_METEO}&units=metric&lang=it`);
        const data = await res.json();

        if (!res.ok) throw new Error("Citta non trovata");

        const messaggioMeteo = `A ${data.name} ci sono ${data.main.temp}°C, e ${data.weather[0].description}, e vento a ${data.wind.speed} m/s.`;

        setlistaRisposte([...nuovalistaRisposte, { role: "assistant", content: messaggioMeteo }]);
        return; //esce
      } catch (err) {
        console.error("Errore: ", err);
      }
    }

    //invia messaggio attesa
    setlistaRisposte([...nuovalistaRisposte, { role: "system", content: "Attendi una risposta..." }]);

    try {

      //fetch richiesta http
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODELLO,
          messages: [...nuovalistaRisposte],
        }),

      });

      const data = await res.json();

      const reply = data.choices[0].message.content;


      setInput(""); //reset input utente

      //mostro messaggio risposta
      setlistaRisposte([...nuovalistaRisposte, { role: "assistant", content: reply }]);
    }
    catch (err) {
      setlistaRisposte([...nuovalistaRisposte, { role: "assistant", content: "Errore!" }]);
    }
  };

  //invio tramite invio (senza shift)
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(); //invia messaggio
    }
  };

  const isMeteoRequest = (text) => {
    const paroleChiave = ["tempo", "meteo", "previsioni", "piove", "caldo", "freddo"];
    const testo = text.toLowerCase();
    return paroleChiave.some(parola => testo.includes(parola));
  };

  const estraiCitta = (text) => {
    // Cerca parole tipo "a", "per", "di", "in" seguite da un nome città
    const regex = /\b(?:a|per|di|in)\s+([A-ZÀ-Úa-zà-ú\s]+)/i;
    const match = text.match(regex);
    if (!match) return null;

    // Pulizia da eventuali caratteri finali tipo punto, virgola, ecc.
    return match[1].trim().replace(/[.,!?]+$/, "");
  };


  //creo metodo per creare nuova pagina
  const refreshChat = () => {
    const existingHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

    const chatCorrente = JSON.stringify(listaRisposte);
    const esisteGia = existingHistory.some(chat => JSON.stringify(chat) === chatCorrente);

    if (!esisteGia && listaRisposte.length > 0) {
      const updatedHistory = [...existingHistory, listaRisposte];
      localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
    }

    localStorage.removeItem("chatRisposte");
    window.location.reload(); //resetta la pagina
  };


  const caricaChat = (indice) => {
    const chatSelezionata = chatHistory[indice];
    if (chatSelezionata) {
      setlistaRisposte(chatSelezionata);
      localStorage.setItem("chatRisposte", JSON.stringify(chatSelezionata));
    }
  };

  const rimuoviCronologia = () => {
    localStorage.removeItem("chatHistory");
    setChatHistory([]);
  };

  const rimuoviChat = (indice) => {
    const nuovaLista = [...chatHistory];
    nuovaLista.splice(indice, 1);
    setChatHistory(nuovaLista);
    localStorage.setItem("chatHistory", JSON.stringify(nuovaLista));
  };

  //creo metodo per la correzione semantica
  const correggiTesto = async (testo) => {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "user",
            content: `Correggi grammaticalmente questo testo in italiano, senza aggiungere nulla: "${testo}"`,
          },
        ]
      }),
    });

    const data = await res.json();
    return data.choices[0].message.content.trim();
  }

  //GUI
  return (
    <>
      <div className="fixed top-4 left-4 z-50 h-[96vh] w-[220px] bg-black text-white rounded-xl p-4 flex flex-col justify-start items-center shadow-lg overflow-hidden">

        {/*BOTTONE NUOVA CHAT E DELETE*/}
        <div className="flex items-center gap-2 mb-4 w-full justify-center">
          <BottoneNuovaChat onClick={refreshChat} className="cursor-pointer rounded hover:bg-[#3a3a3a] transition">
            <CirclePlus />
          </BottoneNuovaChat>

          <BottoneRimuoviCronologia onClick={rimuoviCronologia}>
            <Trash />
          </BottoneRimuoviCronologia>
        </div>

        {/* Scroll area con cronologia */}
        <div className="flex-1 w-full overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <ChatContainer
            chats={chatHistory}
            onSelect={caricaChat}
            onDelete={rimuoviChat}
          />

        </div>

      </div>

      {/*CONTENUTO CHAT*/}
      <div className="max-w-4xl mx-auto h-screen flex flex-col p-4">
        <h2 className="text-white text-2xl mb-4">ChatBot AI (OpenRouter)</h2>

        {/*BOX RISPOSTE AI*/}
        <div
          ref={responseRef}
          className="flex-1 overflow-y-auto bg-black text-white rounded p-4 mb-4"
        >
          <ResponseArea messages={listaRisposte} />
        </div>

        {/*BOX INPUT UTENTE*/}
        <div className="bg-black p-4 rounded flex gap-2">
          <InputArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi qualcosa"
          />

          {/*BOTTONE INVIO*/}
          <Bottone onClick={sendMessage}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" className="w-6 h-6">
              <path
                fillRule="evenodd"
                d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z"
              />
            </svg>
          </Bottone>
        </div>
      </div>
    </>
  );
}
