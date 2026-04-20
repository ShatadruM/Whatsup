import { Response } from 'express';
import User from '../models/User'; 
import { AuthRequest } from '../middleware/authMiddleware';

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Grab the search term from the URL query (?search=...)
    const searchQuery = req.query.search as string;

    if (!searchQuery) {
      res.status(400).json({ message: 'Please provide a search term' });
      return;
    }

    // 2. Build the MongoDB query to search by email OR username (case-insensitive)
    const keyword = {
      $or: [
        { email: { $regex: searchQuery, $options: 'i' } },
        { username: { $regex: searchQuery, $options: 'i' } },
      ],
    };

    // 3. Search the database. 
    // We use $ne (not equal) to ensure the logged-in user doesn't find themselves in the search results.
    // .select('-password') ensures we don't accidentally send hashed passwords to the frontend.
    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user?.userId } })
      .select('-password');

    res.status(200).json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: 'Server error searching for users' });
  }
};