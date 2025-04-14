import React, { Children, useState } from "react";

import Periodcontext from "./Periodcontext.js";

const Periodcontextprovider = ({children}) =>{
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(false);

    return (
        <Periodcontext.Provider value={{
            periods, setPeriods, loading, setLoading
        }}>
            {children}
        </Periodcontext.Provider>
    );
}

export default Periodcontextprovider;