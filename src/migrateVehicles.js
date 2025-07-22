// migrateVehicles.js

import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import vehiclesData from "./data/vehicles.json";
export const migrateVehicles = async() => {
    const colRef = collection(db, "vehicles");

    for (const vehicle of vehiclesData) {
        try {
            await addDoc(colRef, vehicle);
            console.log(`Uploaded: ${vehicle.name}`);
        } catch (err) {
            console.error(`Error uploading ${vehicle.name}:`, err);
        }
    }
};