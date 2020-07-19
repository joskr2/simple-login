import React from "react";
import Link from "./Link";
import { gql, useQuery } from "@apollo/client";
import { LINKS_PER_PAGE } from "../constants";
import { useHistory } from "react-router-dom";


//CORREGIR ----> EN EL BACKEND AGREGAR LOS CAMPOS first , skipi y orderBy (argumentos de paginacion para el query)
// query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
//   feed(first: $first, skip: $skip, orderBy: $orderBy) {
// como no estan en el SCHEMA cuando se hace el query manda un error :
//{"errors":[{"message":"Unknown argument \"first\" on field \"feed\" of type \"Query\".","locations":[{"line":2,"column":8}]},{"message":"Cannot query field \"createdAt\" on type \"Link\".","locations":[{"line":5,"column":7}]
export const FEED_QUERY = gql`
  query FeedQuery {
    feed {
      links {
        id
        # createdAt
        # agregar en el backend el campo created at 
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
      count
    }
  }
`

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
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
`;

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
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
      user {
        id
      }
    }
  }
`;

const LinkList = (props) => {
  const _updateCacheAfterVote = (cache, createVote, linkId) => {
    const isNewPage = props.location.pathname.includes("new");
    const page = parseInt(props.match.params.page, 10);

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? "createdAt_DESC" : null;
    const data = cache.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy },
    });
    const votedLink = data.feed.links.find((link) => link.id === linkId);
    votedLink.votes = createVote.link.votes;
    cache.writeQuery({ query: FEED_QUERY, data });
  };
  let history = useHistory();
  let _subscribeToNewLinks = (subscribeToMore) => {
    subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newLink = subscriptionData.data.newLink;
        const exists = prev.feed.links.find(({ id }) => id === newLink.id);
        if (exists) return prev;

        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename,
          },
        });
      },
    });
  };

  let _subscribeToNewVotes = (subscribeToMore) => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION,
    });
  };
  // const _getQueryVariables = () => {
  //   const isNewPage = props.location.pathname.includes("new");
  //   const page = parseInt(props.match.params.page, 10);

  //   const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
  //   const first = isNewPage ? LINKS_PER_PAGE : 100;
  //   const orderBy = isNewPage ? "createdAt_DESC" : null;
  //   return { first, skip, orderBy };
  // };

  const { loading, error, data, subscribeToMore } = useQuery(FEED_QUERY, {
    //variables: _getQueryVariables(),
    variables: {
      skip: props.location.pathname.includes("new")
        ? (parseInt(props.match.params.page, 10) - 1) * LINKS_PER_PAGE
        : 0,
      first: props.location.pathname.includes("new") ? LINKS_PER_PAGE : 100,
      orderBy:props.location.pathname.includes("new") ? "createdAt_DESC" : null
    },
  });
  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  _subscribeToNewLinks(subscribeToMore);
  _subscribeToNewVotes(subscribeToMore);

  let _getLinksToRender = (data) => {
    const isNewPage = props.location.pathname.includes("new");
    if (isNewPage) {
      return data.feed.links;
    }
    const rankedLinks = data.feed.links.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  };
  const linksToRender = _getLinksToRender(data);
  const isNewPage = props.location.pathname.includes("new");
  const pageIndex = props.match.params.page
    ? (props.match.params.page - 1) * LINKS_PER_PAGE
    : 0;

  let _nextPage = (data) => {
    const page = parseInt(props.match.params.page, 10);
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      history.push(`/new/${nextPage}`);
    }
  };

  let _previousPage = () => {
    const page = parseInt(props.match.params.page, 10);
    if (page > 1) {
      const previousPage = page - 1;
      history.push(`/new/${previousPage}`);
    }
  };
  return (
    <>
      {linksToRender.map((link, index) => (
        <Link
          key={link.id}
          link={link}
          index={index + pageIndex}
          updateStoreAfterVote={_updateCacheAfterVote}
        />
      ))}
      {isNewPage && (
        <div className="flex ml4 mv3 gray">
          <div className="pointer mr2" onClick={_previousPage}>
            Previous
          </div>
          <div className="pointer" onClick={() => _nextPage(data)}>
            Next
          </div>
        </div>
      )}
    </>
  );
};
export default LinkList;
