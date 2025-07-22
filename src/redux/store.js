import { configureStore } from "@reduxjs/toolkit";
import vehicleReducer from "./vehicleSlice";

const store = configureStore({
    reducer: {
        vehicle: vehicleReducer,
    },
});

export default store;