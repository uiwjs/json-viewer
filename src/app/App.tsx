import React, { useCallback, useEffect, useRef} from 'react';
import Split from '@uiw/react-split';
import GitHubCorners from '@uiw/react-github-corners';
import JsonViewer from 'react-json-view';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { json as jsonLang } from '@codemirror/lang-json';
import { createHashHistory } from 'history';
import styles from './App.module.css';

type Parameters = {
  json?: string;
  cornerhref?: string;
  hidenheader?: '1' | '0';
  corner?: '1' | '0';
  view?: 'preview'| 'editor';
}
const history = createHashHistory();
const getURLParameters = (url: string): Parameters =>
  (url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce(
    (a: any, v) => (
      ((a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a)
    ),
    {}
  );
const objectToQueryString = (queryParameters: Parameters) => {
  return queryParameters
    ? Object.entries(queryParameters).reduce(
        (queryString, [key, val], index) => {
          const symbol = queryString.length === 0 ? '?' : '&';
          queryString +=
            typeof val === 'string' ? `${symbol}${key}=${val}` : '';
          return queryString;
        },
        ''
      )
    : '';
};

const App = () => {
  const param = getURLParameters(window.location.href);
  const cmRef = useRef<ReactCodeMirrorRef>(null);
  param.json = param.json ? decodeURI(param.json): undefined;
  const [code, setCode] = React.useState(decodeURIComponent(param.json || ''));
  const [json, setJson] = React.useState();
  const [message, setMessage] = React.useState('');
  const [linebar, setLinebar] = React.useState('');
  
  const handleJson = useCallback(() => {
    setMessage('');
    try {
      if (code) {
        const obj = JSON.parse(code);
        setJson(obj);
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
        setJson(undefined)
      } else {
        throw error;
      }
    }
  }, [code]);
  const formatJson = useCallback((_: any, replacer: number = 2) => {
    setMessage('');
    try {
      if (code) {
        const obj = JSON.parse(code);
        const str = JSON.stringify(obj, null, replacer);
        setCode(str);
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
        setJson(undefined)
      } else {
        throw error;
      }
    }
  }, [code]);

  const shareJson = () => {
    param.json = encodeURI(code);
    history.push(`${objectToQueryString(param)}`, { some: "state" });
  }

  useEffect(() => {
    handleJson()
  }, [code, handleJson]);

  const editor = (
    <div style={{ minWidth: 230, width: param.view === 'editor' ? '100%' : '45%', position: 'relative', backgroundColor: 'rgb(245, 245, 245)' }}>
      <div style={{overflow: 'auto',height: '100%', boxSizing: 'border-box' }}>
        <CodeMirror
          value={code}
          ref={cmRef}
          height="100%"
          style={{ height: '100%' }}
          extensions={[jsonLang()]}
          onUpdate={(cm) => {
            if (param.hidenheader === '1') {
              return;
            }
            const { selection } = cm.state;
            const line = cm.view.state.doc.lineAt(selection.main.from);
            setLinebar(`Line ${line.number}/${cm.state.doc.lines}, Column ${cm.state.selection.main.head - line.from + 1}`);
            const text = cm.state.sliceDoc(selection.main.from, selection.main.to);
            if (text) {
              if (selection.ranges.length > 1) {
                setLinebar(`${selection.ranges.length} selection regions`);
              } else {
                setLinebar(`${text.split('\n').length} lines, ${text.length} characters selected`);
              }
            }
          }}
          onChange={(value, viewUpdate) => {
            setCode(value)
          }}
        />
      </div>
    </div>
  );

  const preview = (
    <div style={{ flex: 1, minWidth: 230, userSelect: 'none', padding: 10, overflow: 'auto' }}>
      {message && (
        <pre style={{ padding: 0, margin: 0, color: 'red' }}>
          {message}
        </pre>
      )}
      {json && typeof json == 'object' && (
        <JsonViewer src={json!} theme="rjv-default" style={{  }} displayDataTypes={false} />
      )}
    </div>
  );
  return (
    <div className={styles.app}>
      {!Number(param.corner) && (
        <GitHubCorners fixed zIndex={999} size={43} target="__blank" href={param.cornerhref ? param.cornerhref : 'https://github.com/uiwjs/json-viewer'} />
      )}
      <Split mode="vertical" visiable={false}>
        {param.hidenheader !== '1' && (
          <div className={styles.header} style={{  }}>
            <h1>JSON Viewer</h1>
            <div className={styles.toolbar}>
              <div>
                {linebar && (
                  <span> {linebar} </span>
                )}
              </div>
              {message && (
                <div className={styles.message}>{message}</div>
              )}
              <div className={styles.btn}>
                <button onClick={formatJson}>
                  Format
                </button>
                <button onClick={() => formatJson(null, 0)}>
                  Compress
                </button>
                {code && (
                  <button onClick={() => shareJson()}>
                    Share
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        <Split style={{ flex: 1, height: param.hidenheader !== '1' ? 'calc(100% - 32px)' : '100%' }}>
          {!param.view && editor}
          {!param.view && preview}
          {param.view === 'editor' && editor}
          {param.view === 'preview' && preview}
        </Split>
      </Split>
    </div>
  )
};

export default App;
