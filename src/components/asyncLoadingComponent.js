import React from 'react';
import Loadable from 'react-loadable';

function asyncLoadingFunction(funcToImportPage) {
  return Loadable({
    loader: funcToImportPage,
    loading: (props) => { 
      if (props.isLoading) {
        return <div>Loading...</div>;
      }else if (props.timedOut) {
        return <div>Timeout. Please retry.</div>
      } else if (props.error) {
        return <div>Sorry, there was a problem when loading.</div>;
      } else {
        return <div>Unknown Error</div>;
      }
    }
  });
}

export default function asyncLoadingExhibition(exhibitionId) {
  return asyncLoadingFunction(()=> import('exhibitions/' + exhibitionId + '/App'));
}
export function asyncLoadingAppUseHooks(exhibitionId) {
  return asyncLoadingFunction(()=> import('exhibitions/' + exhibitionId + '/AppUseHooks'));
}

// export function asyncLoadingComponent(exhibitionId) {
//   return asyncLoadingFunction(()=> import('components/' + exhibitionId + '/App'));
// }

// export function asyncLoadingTemplate(template) {
//   return asyncLoadingFunction(()=> import('containers/templates/' + template));
// }

// export function asyncLoadingLandingTemplate(template) {
//   return asyncLoadingFunction(()=> import('containers/landingTemplates/' + template));
// }