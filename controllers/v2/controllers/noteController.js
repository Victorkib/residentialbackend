// controllers/noteController.js
import Note from '../../../models/v2/models/Note.model.js';

// Get all notes
export const getNotes = async (req, res) => {
  const { tenantId } = req.params;
  try {
    const notes = await Note.find({ tenantId: tenantId });

    if (!notes) {
      return res.status(404).json({ message: 'No note found' });
    }
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new note
export const createNote = async (req, res) => {
  const { title, description, tenantId } = req.body;
  if (!title || !description) {
    return res.status(404).json({ message: 'All Fields must be filled!' });
  }
  try {
    const newNote = await Note.create({
      title,
      description,
      tenantId: tenantId,
    });

    if (!newNote) {
      return res.status(404).json({ message: 'Error creating note' });
    }
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a note
export const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, description, tenantId } = req.body;
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, tenantId: tenantId },
      { title, description },
      { new: true }
    );
    if (!updatedNote) {
      return res
        .status(404)
        .json({ message: 'Note not found and not updated' });
    }
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedNote = await Note.findByIdAndDelete(id);
    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully', deletedNote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
