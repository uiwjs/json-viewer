import React, { useCallback, useEffect, useRef} from 'react';
import Split from '@uiw/react-split';
import GitHubCorners from '@uiw/react-github-corners';
import JsonViewer from 'react-json-view';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { json as jsonLang } from '@codemirror/lang-json';
import styles from './App.module.css';

const App = () => {
  const lineRef = useRef<HTMLSpanElement>(null);
  const cmRef = useRef<ReactCodeMirrorRef>(null);
  const [code, setCode] = React.useState('');
  const [json, setJson] = React.useState();
  const [message, setMessage] = React.useState('');
  
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

  const formatJson = useCallback((_, replacer: number = 2) => {
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

  useEffect(() => {
    handleJson()
  }, [code, handleJson]);

  return (
    <div className={styles.app}>
      <GitHubCorners fixed zIndex={999} size={60} target="__blank" href="https://github.com/uiwjs/json-viewer" />
      <Split mode="vertical" visiable={false}>
        <div className={styles.header} style={{  }}>
          <h1>JSON Viewer</h1>
          <div className={styles.toolbar}>
            <div>
              <span ref={lineRef} />
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
            </div>
          </div>
        </div>
        <Split style={{ flex: 1, height: 'calc(100% - 32px)' }}>
          <div style={{ minWidth: 230, width: '45%', position: 'relative', backgroundColor: 'rgb(245, 245, 245)' }}>
            <div style={{overflow: 'auto',height: '100%', boxSizing: 'border-box' }}>
              <CodeMirror
                value={code}
                ref={cmRef}
                height="100%"
                style={{ height: '100%' }}
                extensions={[jsonLang()]}
                onUpdate={(cm) => {
                  const { selection } = cm.state;
                  const line = cm.view.state.doc.lineAt(selection.main.from);
                  lineRef.current!.innerHTML = `Line ${line.number}/${cm.state.doc.lines}, Column ${cm.state.selection.main.head - line.from + 1}`;
                  const text = cm.state.sliceDoc(selection.main.from, selection.main.to);
                  if (text) {
                    if (selection.ranges.length > 1) {
                      lineRef.current!.innerHTML = `${selection.ranges.length} selection regions`;
                    } else {
                      lineRef.current!.innerHTML = `${text.split('\n').length} lines, ${text.length} characters selected`;
                    }
                  }
                }}
                onChange={(value, viewUpdate) => {
                  setCode(value)
                }}
              />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 230, userSelect: 'none', padding: 10, overflow: 'auto' }}>
            {message && (
              <pre style={{ padding: 0, margin: 0 }}>
                {message}
              </pre>
            )}
            {json && typeof json == 'object' && (
              <JsonViewer src={json!} theme="rjv-default" style={{  }} displayDataTypes={false} />
            )}
          </div>
        </Split>
      </Split>
    </div>
  )
};

export default App;
