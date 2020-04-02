import React from 'react';
import {useEffect} from 'react';

const PageId = ({ pageId, setPageId }) => {
  useEffect(() => {
    console.log(pageId);
  })
  return <div onClick={() => {
    console.log('click');
    console.log(pageId);
    setPageId(Math.random())
  }}>
    PageId: {pageId}
  </div>
}


export default PageId;