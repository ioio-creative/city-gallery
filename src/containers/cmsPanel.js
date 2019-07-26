import React from 'react';

class CmsPanel extends React.Component {
  componentDidMount() {
    document.addEventListener('click', this.onClick);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.onClick);
  }
  onClick(e) {
    console.log(`${e.clientX}, ${e.clientY}`);
  }
  render() {
    return <div id="cmsPanel">
      <ul className="locationList">
        <li></li>
      </ul>
    </div>;
  }
}

export default CmsPanel;