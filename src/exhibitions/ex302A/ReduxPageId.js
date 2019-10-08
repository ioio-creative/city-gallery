import { connect } from 'react-redux';
import { setPageId } from './redux/actions';
import PageId from './PageId';

const mapStateToProps = state => {
  return {
    pageId: state.exhibitionStatusReducer.pageid
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setPageId: id => {
      dispatch(setPageId(id))
    }
  }
}

const ReduxPageId = connect(
  mapStateToProps,
  mapDispatchToProps
)(PageId)

export default ReduxPageId;