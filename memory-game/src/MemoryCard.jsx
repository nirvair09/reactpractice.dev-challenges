import React from "react";

function MemoryCard({image,isFlipped,isMatched,onClick}){
    return(
        <div
        className="card"
        onClick={onClick}
        style={{cursor:isMatched?"default":"pointer"}}
        >
            {isFlipped || isMatched?(
                <img src={image} alt="memory card" className="card-img" />
            ):(
                <div className="card-back">?</div>
            )}
        </div>
    );
}

export default MemoryCard;