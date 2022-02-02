import Panel from './Panel';
import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import algoliasearch from 'algoliasearch/lite';
import {FiSearch} from 'react-icons/fi';
import {Input, InputGroup, InputLeftElement} from '@chakra-ui/react';
import {createAutocomplete} from '@algolia/autocomplete-core';
import {getAlgoliaResults} from '@algolia/autocomplete-preset-algolia';

const SOURCES = {
  docs: 'Documentation',
  blog: 'Blog',
  odyssey: 'Odyssey'
};

const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_SEARCH_KEY
);

export default function Autocomplete({onClose}) {
  const [autocompleteState, setAutocompleteState] = useState({});

  useEffect(() => {
    if (autocompleteState.activeItemId === null) {
      onClose();
    }
  }, [autocompleteState, onClose]);

  const autocomplete = useMemo(
    () =>
      createAutocomplete({
        debug: true,
        defaultActiveItemId: 0,
        onStateChange: ({state}) => setAutocompleteState(state),
        getSources: () =>
          Object.keys(SOURCES).map((indexName, index) => ({
            sourceId: indexName,
            getItemUrl: ({item}) => item.url,
            getItemInputValue: ({item}) => item.query,
            getItems: ({query}) =>
              getAlgoliaResults({
                searchClient,
                queries: [
                  {
                    indexName,
                    query,
                    params: {
                      hitsPerPage: index ? 2 : 8,
                      highlightPreTag: '<mark>',
                      highlightPostTag: '</mark>'
                    }
                  }
                ]
              }),
            onActive: ({item, setContext}) => setContext({preview: item})
          }))
      }),
    []
  );

  return (
    <div {...autocomplete.getRootProps({})}>
      <InputGroup
        size="lg"
        borderBottomWidth={autocompleteState.isOpen && '1px'}
      >
        <Input
          borderWidth="0"
          focusBorderColor="transparent"
          roundedBottom={autocompleteState.isOpen ? 'none' : undefined}
          {...autocomplete.getInputProps({
            type: null,
            placeholder: 'What do you want to learn about GraphQL?'
          })}
        />
        <InputLeftElement>
          <FiSearch />
        </InputLeftElement>
      </InputGroup>
      {autocompleteState.isOpen && (
        <Panel
          sources={SOURCES}
          autocomplete={autocomplete}
          autocompleteState={autocompleteState}
        />
      )}
    </div>
  );
}

Autocomplete.propTypes = {
  onClose: PropTypes.func.isRequired
};