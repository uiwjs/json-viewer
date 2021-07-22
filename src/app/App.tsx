import React, { useCallback, useEffect, useRef} from 'react';
import Split from '@uiw/react-split';
import CodeEditor, { SelectionText } from '@uiw/react-textarea-code-editor';
import JsonViewer from 'react-json-view';
import styles from './App.module.css';

const App = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colElm = useRef<HTMLSpanElement>(null);
  const selectedElm = useRef<HTMLSpanElement>(null);
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
      setMessage(error.message);
      setJson(undefined)
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
      setMessage(error.message);
      setJson(undefined)
    }
  }, [code]);

  const handleSelect = useCallback((evn: React.SyntheticEvent<HTMLTextAreaElement>) => {
    handleColLn(evn.target as HTMLTextAreaElement);
  }, []);

  const handleColLn = (target: HTMLTextAreaElement | null) => {
    if (!target) {
      return
    }
    const result = new SelectionText(target as HTMLTextAreaElement);
    colElm.current!.innerHTML = result.end as unknown as string;
    selectedElm.current!.innerHTML = result.end - result.start === 0 ? '' : ` selected(${result.end - result.start})`;
  }

  useEffect(() => {
    handleColLn(textareaRef.current)
  }, []);

  useEffect(() => {
    handleJson()
  }, [code, handleJson]);

  return (
    <div className={styles.app}>
      <Split>
        <div style={{ minWidth: 230, width: '45%', position: 'relative', backgroundColor: 'rgb(245, 245, 245)' }}>
          <div style={{overflow: 'auto',height: '100%', paddingBottom: 25, boxSizing: 'border-box' }}>
            <CodeEditor
              value={code}
              language="json"
              placeholder="Please enter JSON code."
              ref={textareaRef}
              onChange={(evn) => setCode(evn.target.value)}
              padding={5}
              onMouseMove={handleSelect}
              onSelect={handleSelect}
              style={{
                minHeight: '100%',
                fontSize: 12,
                backgroundColor: "#f5f5f5",
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
              }}
            />
          </div>
          <div className={styles.toolbar}>
            <div>
              <button onClick={formatJson}>
                Format
              </button>
              <button onClick={() => formatJson(null, 0)}>
                Compress
              </button>
            </div>
            <div>
              <span ref={colElm} /><span ref={selectedElm} />
            </div>
            <div>
              {message && (
                <div className={styles.message}>{message}</div>
              )}
            </div>
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
    </div>
  )
};

export default App;
