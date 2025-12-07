import React, { useState, useEffect } from 'react';
import { Note } from '@/entities/Note';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, StickyNote } from 'lucide-react';

const noteColors = {
    yellow: 'bg-yellow-100 border-yellow-200',
    blue: 'bg-blue-100 border-blue-200',
    green: 'bg-green-100 border-green-200',
    pink: 'bg-pink-100 border-pink-200',
};

export default function NotesWidget() {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [newNoteColor, setNewNoteColor] = useState('yellow');

    const loadNotes = async () => setNotes(await Note.list('-created_date'));
    useEffect(() => { loadNotes() }, []);

    const addNote = async () => {
        if (!newNote.trim()) return;
        await Note.create({ content: newNote, color: newNoteColor });
        setNewNote('');
        loadNotes();
    };
    
    const deleteNote = async (id) => {
        await Note.delete(id);
        loadNotes();
    };

    return (
        <Card className="shadow-md h-full mobile-card">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg mobile-title">
                    <StickyNote className="text-yellow-600 w-4 h-4 md:w-5 md:h-5" />
                    <span>ملاحظات سريعة</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {notes.map(note => (
                        <div key={note.id} className={`p-2 rounded-lg border relative ${noteColors[note.color]}`}>
                            <p className="text-xs mobile-text">{note.content}</p>
                            <Button variant="ghost" size="icon" className="absolute top-0 left-0 w-6 h-6" onClick={() => deleteNote(note.id)}>
                                <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="اكتب ملاحظتك هنا..." rows={2} />
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            {Object.keys(noteColors).map(color => (
                                <button key={color} onClick={() => setNewNoteColor(color)} className={`w-5 h-5 rounded-full ${noteColors[color].split(' ')[0]} border-2 ${newNoteColor === color ? 'border-gray-600' : 'border-transparent'}`}></button>
                            ))}
                        </div>
                        <Button onClick={addNote} size="sm"><Plus className="w-4 h-4 ml-1" /> إضافة</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}