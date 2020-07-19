import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";
import { FEED_QUERY } from "./LinkList";
import { LINKS_PER_PAGE } from "../constants";

const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      url
      description
    }
  }
`;

const CreateLink = () => {
  let history = useHistory();
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [updatePostMutation, { loading, error }] = useMutation(POST_MUTATION, {
    onCompleted({ updatePostMutation }) {
      history.push("/new/1");
    },
    update(cache, { data: { post } }) {
      const first = LINKS_PER_PAGE;
      const skip = 0;
      const orderBy = "createdAt_DESC";
      const data = cache.readQuery({
        query: FEED_QUERY,
        variables: { first, skip, orderBy },
      });
      data.feed.links.unshift(post);
      cache.writeQuery({
        query: FEED_QUERY,
        data,
        variables: { first, skip, orderBy },
      });
    },
  });
  if (loading) return <p>loading...</p>;
  if (error) return <p>An error occurred</p>;

  return (
    <div>
      <div className="flex flex-column mt3">
        <input
          className="mb2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          type="text"
          placeholder="A description for the link"
        />
        <input
          className="mb2"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="text"
          placeholder="The URL for the link"
        />
      </div>
      <button
        onClick={() =>
          updatePostMutation({
            variables: { description: description, url: url },
          })
        }
      >
        Submit
      </button>
    </div>
  );
};
export default CreateLink;
