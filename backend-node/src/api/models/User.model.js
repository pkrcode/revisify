import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      // A simple regex to validate email format, though we'll primarily use express-validator.
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      // Prevent password from being returned in query results by default
      select: false, 
    },
  },
  {
    // This option automatically adds `createdAt` and `updatedAt` fields.
    // This fulfills your requirement for a `createdOn` field in a more standard way.
    timestamps: true,
  }
);

// --- Mongoose Middleware (pre-save hook) ---
// This function runs before a document is saved to the database.
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // Hash the password with a salt round of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Mongoose Instance Method ---
// This method is available on all instances of the User model.
// It's used to compare the password provided at login with the stored hashed password.
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model('User', userSchema);

export default User;