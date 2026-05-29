import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export const getUserByName = async (userName: string) => {
  const q = query(
    collection(db, "ele_user"),
    where("user_name", "array-contains", userName)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
};