// pages/index.jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Calendar from '../components/Calendar';

// ── localStorage helpers ──
function loadNotes() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('lumina_notes') || '{}'); }
  catch { return {}; }
}
function saveNotes(notes) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lumina_notes', JSON.stringify(notes));
}

export default function Home() {
  const [dark, setDark]     = useState(true);
  const [notes, setNotes]   = useState({});

  // ── Load notes from localStorage on mount ──
  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  // ── Persist notes on every change ──
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // ── Apply theme class to <html> ──
  useEffect(() => {
    document.documentElement.className = dark ? '' : 'light';
  }, [dark]);

  // ── Note operations ──
  const handleAddNote = (date, text) => {
    setNotes(prev => ({
      ...prev,
      [date]: [...(prev[date] || []), text],
    }));
  };

  const handleDeleteNote = (date, idx) => {
    setNotes(prev => {
      const arr = [...(prev[date] || [])];
      arr.splice(idx, 1);
      if (!arr.length) {
        const next = { ...prev };
        delete next[date];
        return next;
      }
      return { ...prev, [date]: arr };
    });
  };

  return (
    <>
      <Head>
        <title>Lumina Calendar</title>
        <meta name="description" content="A premium interactive wall calendar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🗓</text></svg>" />
      </Head>

      <Header dark={dark} onToggleTheme={() => setDark(d => !d)} />

      <Calendar
        notes={notes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
      />
    </>
  );
}
