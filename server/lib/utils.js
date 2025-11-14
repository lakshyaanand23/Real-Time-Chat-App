// import jwt from "jsonwebtoken";

// //Function to generate a token for a user
// export const generateToken = (userId) => {
//   const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
//   return token;
// };

import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
// import jwt from "jsonwebtoken";

// // Function to generate a token for a user
// export const generateToken = (userId) => {
//   const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
//     expiresIn: "7d", // optional: sets token expiration
//   });
//   return token;
// };
