const Presentation = ({ source, title }) => {
  return (
    <div>
      <iframe
        src={source}
        title={title || "Presentation"}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ width: "100%", height: 500, border: 0, marginBottom: -4 }}
      />
    </div>
  );
};

export default Presentation;
