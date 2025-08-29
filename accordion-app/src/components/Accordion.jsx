import { useState } from "react";

const AccordionItem = ({ title, content, isOpen, onClick }) => (
  <div className="accordion-item">
    <button className="accordion-header" onClick={onClick}>
      <span>{title}</span>
      <span className={`arrow ${isOpen ? "open" : ""}`}>&#9660;</span>
    </button>
    {isOpen && <div className="accordion-content">{content}</div>}
  </div>
);

export default function Accordion({ data }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {data.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          content={item.content}
          isOpen={openIndex === index}
          onClick={() => toggleAccordion(index)}
        />
      ))}
    </div>
  );
}
