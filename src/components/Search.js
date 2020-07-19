import React, { useState } from "react";
import { gql } from "@apollo/client";
//import { withApollo } from "@apollo/react-hoc";
import Link from "./Link";
import { client } from "../index";


const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
        id
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

const Search = (props) => {
  const [links, setLinks] = useState([]);
  const [filter, setFilter] = useState("");

    let _executeSearch = async () => {
      const result = await client.query({
        query: FEED_SEARCH_QUERY,
        variables: { filter },
      });
      const links = result.data.feed.links;
      setLinks(links);
    };
  

  return (
    <div>
      <div>
        Search
        <input type="text" onChange={(e) => setFilter(e.target.value)} />
        <button onClick={() => _executeSearch()}>OK</button>
      </div>
      {links.map((link, index) => (
        <Link key={link.id} link={link} index={index} />
      ))}
    </div>
  );
};
//export default withApollo(Search);

export default Search;
