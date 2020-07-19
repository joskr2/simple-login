import React from "react";
import { AUTH_TOKEN } from "../constants";
//import { timeDifferenceForDate } from "../utils";
import { gql, useMutation } from "@apollo/client";

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
        id
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

const Link = (props) => {
  const authToken = localStorage.getItem(AUTH_TOKEN);

  const [voteMutation, { loading, error }] = useMutation(VOTE_MUTATION);
  if (loading) return <p>loading votes...</p>;
  if (error) return <p>An error occurred on votes mutation</p>;

  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray">{props.index + 1}.</span>
        {authToken && (
          <div
            className="ml1 gray f11"
            onClick={() =>
              voteMutation({
                variables: { linkId: props.link.id },
                // update(cache, { data: { vote } }) {
                //   console.log(cache, "cache en update de Link- mutacion -> voteMutation")
                //   console.log(vote, "vote en mutacion de Link , voteMutation")
                //   props.updateStoreAfterVote(cache, vote, props.link.id)
                // }
              })
            }
          >
            ▲
          </div>
        )}
      </div>
      <div className="ml1">
        <div>
          {props.link.description} ({props.link.url})
        </div>
        <div className="f6 lh-copy gray">
          {props.link.votes.length} votes | by{" "}
          {props.link.postedBy ? props.link.postedBy.name : "Unknown"}{" "}
        </div>
      </div>
    </div>
  );
};

export default Link;
