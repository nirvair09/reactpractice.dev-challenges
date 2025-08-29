import Accordion from "./components/Accordion";
import accordionData from "./data/accordionData";
import "./App.css";

function App() {
  return (
    <div className="app">
      <h1>Simple React Accordion</h1>
      <Accordion data={accordionData} />
    </div>
  );
}

export default App;
