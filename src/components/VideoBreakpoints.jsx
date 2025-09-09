const VideoBreakpoints = ({ breakpoints, onBreakpointClick }) => {
  return (
    <div className="video-breakpoints-container">
       <div className="h3-orange">Principalele subiecte abordate:</div>
       <div className="video-breakpoints-wrapper">
        {breakpoints.map((breakpoint, index) => (
          <div
            key={index}
            className="video-breakpoints-item"
            data-seconds={breakpoint.seconds}
            title={breakpoint.name}
            onClick={() => onBreakpointClick(breakpoint.seconds)}
          >
            <div>
              <span style={{fontWeight: '700'}}>{breakpoint.time}</span>
            </div>
            <div >
              <div>{breakpoint.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoBreakpoints;