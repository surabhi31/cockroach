// Copyright 2020 The Cockroach Authors.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the Apache License, Version 2.0, included in the file
// licenses/APL.txt.

import { getMatchParamByName } from "src/util/query";
import { sessionAttr } from "src/util/constants";
import _ from "lodash";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { createSelector } from "reselect";
import { Pick } from "src/util/pick";
import { AdminUIState } from "src/redux/state";
import { SessionsResponseMessage } from "src/util/api";
import { connect } from "react-redux";
import { CachedDataReducerState, refreshSessions } from "src/redux/apiReducers";
import { nodeDisplayNameByIDSelector } from "src/redux/nodes";

import {
  SessionDetails,
  byteArrayToUuid,
} from "@cockroachlabs/admin-ui-components";
import { terminateQueryAction } from "src/redux/sessions/sessionsSagas";

type SessionsState = Pick<AdminUIState, "cachedData", "sessions">;

export const selectSession = createSelector(
  (state: SessionsState) => state.cachedData.sessions,
  (_state: SessionsState, props: RouteComponentProps) => props,
  (
    state: CachedDataReducerState<SessionsResponseMessage>,
    props: RouteComponentProps<any>,
  ) => {
    if (!state.data) {
      return null;
    }
    const sessionID = getMatchParamByName(props.match, sessionAttr);
    return {
      session: state.data.sessions.find(
        (session) => byteArrayToUuid(session.id) === sessionID,
      ),
    };
  },
);
// tslint:disable-next-line:variable-name
const SessionDetailsPageConnected = withRouter(
  connect(
    (state: AdminUIState, props: RouteComponentProps) => ({
      nodeNames: nodeDisplayNameByIDSelector(state),
      session: selectSession(state, props),
      sessionError: state.cachedData.sessions.lastError,
    }),
    {
      refreshSessions,
      cancel: terminateQueryAction,
    },
  )(SessionDetails),
);

export default SessionDetailsPageConnected;
