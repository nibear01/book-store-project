import axios from 'axios';
import { createContext, useEffect, useState } from 'react'

export const BooksContext = createContext();

const BooksContextProvider = (props) => {

    const url = import.meta.env.VITE_BACKEND_URL;

    const value = {
        url
    }

    return (
        <BooksContext.Provider value={value}>
            {props.children}
        </BooksContext.Provider>
    )
}

export { BooksContextProvider };