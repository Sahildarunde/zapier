import { PayloadAction, createSlice } from "@reduxjs/toolkit"

type ThemeState = {
    theme: 'light' | 'dark'
}

const initialState: ThemeState = {
    theme: 'light'
}

const themeSlice = createSlice({
    name : 'theme',
    initialState,
    reducers: {
        toggleTheme:(state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light'
            localStorage.setItem('theme', state.theme);  
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
            document.documentElement.setAttribute('data-theme', state.theme);
            localStorage.setItem('theme', state.theme); 
        }
    }
}) 

export const { toggleTheme, setTheme} = themeSlice.actions
export default themeSlice.reducer