import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { notesApi, Note, NoteWithContent } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, LogOut, Trash2, Save, FileText } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<NoteWithContent | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isNewNote, setIsNewNote] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!token) return;

    try {
      const response = await notesApi.getAll(token);
      setNotes(response.notes || []);
    } catch (error) {
      toast.error("Failed to load notes");
    }
  }, [token]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSelectNote = async (noteId: string) => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await notesApi.getById(token, noteId);
      setCurrentNote(response.note);
      setTitle(response.note.title);
      setContent(response.note.content);
      console.log(response.note.content);
      setIsNewNote(false);
    } catch (error) {
      toast.error("Failed to load note");
    } finally {
      setLoading(false);
    }
  };

  const handleNewNote = () => {
    setCurrentNote(null);
    setTitle("Untitled Note");
    setContent("");
    setIsNewNote(true);
  };

  const handleSave = async () => {
    if (!token) return;

    setLoading(true);
    try {
      if (isNewNote || !currentNote) {
        const response = await notesApi.create(token, title, content);
        setNotes([response.note, ...notes]);
        setCurrentNote({ ...response.note, content });
        setIsNewNote(false);
        toast.success("Note created!");
      } else {
        const response = await notesApi.update(token, currentNote._id, title, content);
        setNotes(notes.map(n => n._id === currentNote._id ? response.note : n));
        setCurrentNote({ ...response.note, content });
        toast.success("Note saved!");
      }
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !noteToDelete) return;

    try {
      await notesApi.delete(token, noteToDelete);
      setNotes(notes.filter(n => n._id !== noteToDelete));

      if (currentNote?._id === noteToDelete) {
        setCurrentNote(null);
        setTitle("");
        setContent("");
      }

      toast.success("Note deleted!");
    } catch (error) {
      toast.error("Failed to delete note");
    } finally {
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-sidebar-border bg-sidebar-background flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-sidebar-foreground">My Notes</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
          <Button onClick={handleNewNote} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {notes.length === 0 ? (
              <div className="text-center py-8 px-4 text-muted-foreground text-sm">
                No notes yet. Create your first note!
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note._id}
                  className={`group flex items-center gap-2 p-3 mb-1 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-colors ${
                    currentNote?._id === note._id ? "bg-sidebar-accent" : ""
                  }`}
                  onClick={() => handleSelectNote(note._id)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-sidebar-foreground truncate">
                      {note.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(note._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {currentNote || isNewNote ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 px-2"
                placeholder="Note title..."
              />
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
            <div className="flex-1 overflow-hidden" data-color-mode="light">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || "")}
                height="100%"
                preview="edit"
                hideToolbar={false}
                visibleDragbar={false}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg mb-2">No note selected</p>
              <p className="text-sm">Select a note or create a new one to get started</p>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
