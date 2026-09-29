import { Response } from 'express';
import Document from '../models/document.model';
import { AuthRequest } from '../middleware/auth';
import cloudinary from '../config/cloudinary';

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { type, bookingId, expiryDate, uploadedByRole } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const result = await cloudinary.uploader.upload_stream(
      { folder: 'lcl-documents' },
      async (error, uploadResult) => {
        if (error) return res.status(500).json({ success: false, message: error.message });

        const doc = await Document.create({
          userId: req.user?._id,
          bookingId,
          type,
          fileName: file.originalname,
          fileUrl: uploadResult?.secure_url || '',
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
          uploadedByRole: uploadedByRole || 'customer',
          status: 'uploaded',
          version: 1,
          history: []
        });

        res.status(201).json({ success: true, document: doc });
      }
    ).end(file.buffer);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyDocuments = async (req: AuthRequest, res: Response) => {
  try {
    // If Admin, get all docs, otherwise user specific. Let's just get user specific for now as requested.
    const documents = await Document.find({ userId: req.user?._id }).sort({ createdAt: -1 });
    res.json({ success: true, documents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body; // should be 'verified' or 'rejected'
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status, verifiedBy: req.user?._id },
      { new: true }
    );
    res.json({ success: true, document: doc });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const replaceDocument = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const existingDoc = await Document.findById(req.params.id);
    if (!existingDoc) return res.status(404).json({ success: false, message: 'Document not found' });

    await cloudinary.uploader.upload_stream(
      { folder: 'lcl-documents' },
      async (error, uploadResult) => {
        if (error) return res.status(500).json({ success: false, message: error.message });

        // Save old file to history
        existingDoc.history.push({
          fileUrl: existingDoc.fileUrl,
          fileName: existingDoc.fileName,
          version: existingDoc.version,
          uploadedAt: existingDoc.updatedAt || existingDoc.createdAt || new Date()
        });

        existingDoc.fileUrl = uploadResult?.secure_url || '';
        existingDoc.fileName = file.originalname;
        existingDoc.version += 1;
        existingDoc.status = 'uploaded'; // reset status on replace
        existingDoc.verifiedBy = undefined;
        
        await existingDoc.save();

        res.status(200).json({ success: true, document: existingDoc });
      }
    ).end(file.buffer);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
