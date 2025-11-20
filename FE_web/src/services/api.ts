const AUTH_BASE_URL =
  (import.meta.env.VITE_AUTH_BASE_URL as string) || "/auth";
const NOTES_BASE_URL =
  (import.meta.env.VITE_NOTES_BASE_URL as string) || "/notes";

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Note {
  _id: string;
  userId: string;
  title: string;
  fileKey: string;
  createdAt: string;
}

export interface NoteWithContent extends Note {
  content: string;
}

export const authApi = {
  signup: async (data: SignupData) => {
    const response = await fetch(`${AUTH_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Signup failed" }));
      throw new Error(error.message || "Signup failed");
    }

    return response.json();
  },

  login: async (data: LoginData) => {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Login failed" }));
      throw new Error(error.message || "Invalid credentials");
    }
    return response.json();
  },
};

export const notesApi = {
  create: async (token: string, title: string, content: string): Promise<{ note: Note }> => {
    const response = await fetch(NOTES_BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      throw new Error("Failed to create note");
    }

    return response.json();
  },

  getAll: async (token: string): Promise<{ notes: Note[] }> => {
    const response = await fetch(NOTES_BASE_URL, {
      method: "GET",
      headers: {
        "Authorization": token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch notes");
    }

    return response.json();
  },

  getById: async (token: string, id: string): Promise<{
    content: any; note: NoteWithContent
}> => {
    const response = await fetch(`${NOTES_BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        "Authorization": token,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error("Failed to fetch note");
    }
    const result = await response.json();
    const content = result.content;
    //append content to result.note
    result.note.content = content;
    return result;
  },

  update: async (token: string, id: string, title: string, content: string): Promise<{ note: Note }> => {
    const response = await fetch(`${NOTES_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      throw new Error("Failed to update note");
    }

    return response.json();
  },

  delete: async (token: string, id: string): Promise<{ message: string }> => {
    const response = await fetch(`${NOTES_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete note");
    }

    return response.json();
  },
};
