import React, { useState, useEffect, useRef } from 'react';

// 法律用語サンプルデータ
const legalTerms = [
  "憲法第13条",
  "不法行為責任",
  "過失相殺",
  "民法第709条",
  "債務不履行責任",
  "保証債務",
  "取締役の善管注意義務",
  "行政裁量",
  "信義則",
  "期間の計算",
  "法律行為の解釈",
  "正当防衛",
  "過失犯",
  "共謀共同正犯",
  "間接正犯",
  "国家賠償責任",
  "累犯加重",
  "控訴審における審理の範囲",
  "既判力",
  "不当利得返還請求権"
];

// 法律文章サンプルデータ
const legalSentences = [
  "民法第709条に基づく不法行為責任が成立するためには、故意または過失、権利侵害、損害の発生、因果関係が必要である。",
  "憲法第13条は、個人の尊重と生命・自由・幸福追求の権利を保障している。",
  "行政行為は、法律に特別の定めがある場合を除いて、行政庁がその判断を誤った場合にも当然には無効とならない。",
  "刑法第36条に規定される正当防衛が成立するためには、侵害の急迫性、防衛の意思、防衛行為の相当性が必要である。",
  "民事訴訟における訴訟要件の具備は、裁判所の職権調査事項である。"
];

const TypingApp = () => {
  const [mode, setMode] = useState('menu'); // 'menu', 'terms', 'sentences'
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [questionCount, setQuestionCount] = useState(10); // デフォルトは10問
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [wpm, setWpm] = useState(0);
  const inputRef = useRef(null);

  // 次の問題を取得
  const getNextQuestion = () => {
    let text = '';
    
    if (mode === 'terms') {
      const randomIndex = Math.floor(Math.random() * legalTerms.length);
      text = legalTerms[randomIndex];
    } else if (mode === 'sentences') {
      const randomIndex = Math.floor(Math.random() * legalSentences.length);
      text = legalSentences[randomIndex];
    }
    
    return text;
  };

  // モード選択時にテキストをセット
  useEffect(() => {
    if (mode !== 'menu') {
      // 新しいテキストをセット
      setCurrentText(getNextQuestion());
      
      // 入力開始時に時間を記録
      setStartTime(Date.now());
      setUserInput('');
      setCurrentPosition(0);
      setMistakes(0);
      setCompleted(false);
      setIsTyping(false);
      setWpm(0);
      
      // 入力フィールドにフォーカス
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [mode]);

  // WPMの計算と更新
  useEffect(() => {
    let interval;
    if (isTyping && startTime && !completed) {
      interval = setInterval(() => {
        const timeInMinutes = (Date.now() - startTime) / 60000;
        const currentWpm = (userInput.length / 5) / timeInMinutes;
        setWpm(Math.round(currentWpm));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTyping, startTime, userInput, completed]);

  // 入力の処理
  const handleInput = (e) => {
    const value = e.target.value;
    setUserInput(value);
    
    if (!isTyping) {
      setIsTyping(true);
    }
    
    // 正確に入力されているかチェック
    let correctChars = 0;
    let newMistakes = 0;
    
    for (let i = 0; i < value.length; i++) {
      if (i < currentText.length && value[i] === currentText[i]) {
        correctChars++;
      } else {
        newMistakes++;
      }
    }
    
    setCurrentPosition(correctChars);
    setMistakes(newMistakes);
    
    // タイピング完了チェック
    if (correctChars === currentText.length) {
      setEndTime(Date.now());
      setCompleted(true);
      setIsTyping(false);
      
      // 結果を保存
      const result = calculateResults();
      if (result) {
        setSessionResults(prev => [...prev, result]);
      }
    }
  };

  // 結果の計算
  const calculateResults = () => {
    if (!startTime || !endTime) return null;
    
    const timeInSeconds = (endTime - startTime) / 1000;
    const wordsPerMinute = (currentText.length / 5) / (timeInSeconds / 60);
    const accuracy = ((currentText.length - mistakes) / currentText.length) * 100;
    
    return {
      time: timeInSeconds.toFixed(2),
      wpm: wordsPerMinute.toFixed(2),
      accuracy: accuracy.toFixed(2),
      text: currentText
    };
  };

  // 次の問題に進む
  const moveToNextQuestion = () => {
    // 次の問題に進める
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    
    // 全問題終了したかチェック
    if (nextIndex >= questionCount) {
      // セッション終了 - 結果表示画面へ
      setMode('results');
      return;
    }
    
    // 次の問題をセット
    setCurrentText(getNextQuestion());
    setStartTime(Date.now());
    setEndTime(null);
    setUserInput('');
    setCurrentPosition(0);
    setMistakes(0);
    setCompleted(false);
    setIsTyping(false);
    setWpm(0);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // メニュー画面に戻る
  const returnToMenu = () => {
    setMode('menu');
    setCurrentText('');
    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setMistakes(0);
    setCurrentPosition(0);
    setCompleted(false);
    setIsTyping(false);
    setWpm(0);
  };

  // 文字の表示スタイルを決定
  const getCharStyle = (index) => {
    if (index < currentPosition) {
      return { color: 'green' }; // 正確に入力された文字
    } else if (index === currentPosition) {
      return { color: 'blue', textDecoration: 'underline' }; // 現在の位置
    }
    return { color: 'black' }; // まだ入力されていない文字
  };

  // 問題数選択の処理
  const handleQuestionCountSelect = (count) => {
    setQuestionCount(count);
  };

  // モード選択の処理
  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setCurrentQuestionIndex(0);
    setSessionResults([]);
  };

  // メニュー画面の表示
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-8 text-indigo-700">司法試験CBT対応タイピングトレーニング</h1>
      
      <div className="mb-8 w-full max-w-md">
        <p className="mb-3 text-gray-600 font-medium">問題数を選択してください</p>
        <div className="flex justify-between space-x-2">
          {[10, 20, 30, 50].map(count => (
            <button 
              key={count}
              onClick={() => handleQuestionCountSelect(count)} 
              className={`flex-1 p-3 rounded-lg transition-colors ${
                questionCount === count 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {count}問
            </button>
          ))}
        </div>
      </div>
      
      <p className="mb-6 text-gray-600 font-medium">トレーニングモードを選択してください</p>
      <div className="flex flex-col space-y-4 w-full max-w-md">
        <button 
          onClick={() => handleModeSelect('terms')} 
          className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          法律用語タイピング
        </button>
        <button 
          onClick={() => handleModeSelect('sentences')} 
          className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          法律文章タイピング
        </button>
      </div>
    </div>
  );

  // タイピング画面の表示
  const renderTypingChallenge = () => {
    const results = completed ? calculateResults() : null;
    
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg shadow-md">
        <div className="w-full max-w-2xl flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">
            {mode === 'terms' ? '法律用語タイピング' : '法律文章タイピング'}
          </h2>
          <div className="text-lg font-medium">
            <span className="text-indigo-600">{currentQuestionIndex + 1}</span>
            <span className="text-gray-500">/{questionCount}問</span>
          </div>
        </div>
        
        <div className="mb-8 p-4 bg-white rounded-lg shadow-inner w-full max-w-2xl">
          {currentText.split('').map((char, index) => (
            <span key={index} style={getCharStyle(index)}>
              {char}
            </span>
          ))}
        </div>
        
        <div className="w-full max-w-2xl mb-6">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInput}
            disabled={completed}
            className="p-3 border-2 border-gray-300 rounded-lg w-full focus:border-indigo-500 focus:outline-none"
            placeholder="ここに入力してください..."
          />
          {isTyping && (
            <div className="mt-2 text-sm text-gray-600">
              現在の速度: {wpm} WPM
            </div>
          )}
        </div>
        
        {completed && results && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 w-full max-w-2xl">
            <h3 className="font-bold mb-2">タイピング結果</h3>
            <p>時間: {results.time}秒</p>
            <p>速度: {results.wpm} WPM</p>
            <p>正確性: {results.accuracy}%</p>
          </div>
        )}
        
        <div className="flex space-x-4">
          {completed && (
            <button
              onClick={moveToNextQuestion}
              className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {currentQuestionIndex + 1 >= questionCount ? "結果を見る" : "次の問題へ"}
            </button>
          )}
          <button
            onClick={returnToMenu}
            className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            中断してメニューに戻る
          </button>
        </div>
      </div>
    );
  };
  
  // 結果表示画面
  const renderResults = () => {
    // 平均値の計算
    const avgWpm = sessionResults.reduce((sum, result) => sum + parseFloat(result.wpm), 0) / sessionResults.length;
    const avgAccuracy = sessionResults.reduce((sum, result) => sum + parseFloat(result.accuracy), 0) / sessionResults.length;
    const totalTime = sessionResults.reduce((sum, result) => sum + parseFloat(result.time), 0);
    
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700">タイピング練習結果</h2>
        
        <div className="mb-8 p-6 bg-white rounded-lg shadow w-full max-w-2xl">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 mb-1">問題数</p>
              <p className="text-2xl font-bold text-indigo-700">{sessionResults.length}問</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 mb-1">平均速度</p>
              <p className="text-2xl font-bold text-indigo-700">{avgWpm.toFixed(2)} WPM</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 mb-1">平均正確性</p>
              <p className="text-2xl font-bold text-indigo-700">{avgAccuracy.toFixed(2)}%</p>
            </div>
          </div>
          
          <h3 className="font-bold text-lg mb-3 border-b pb-2">問題別詳細</h3>
          <div className="max-h-64 overflow-y-auto">
            {sessionResults.map((result, index) => (
              <div key={index} className="border-b py-3">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">問題 {index + 1}</span>
                  <span className="text-gray-500">{result.time}秒</span>
                </div>
                <p className="text-gray-700 mb-1 truncate">{result.text}</p>
                <div className="flex justify-between text-sm">
                  <span>速度: <span className="font-medium">{result.wpm} WPM</span></span>
                  <span>正確性: <span className="font-medium">{result.accuracy}%</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => handleModeSelect(mode)}
            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            同じモードで再挑戦
          </button>
          <button
            onClick={returnToMenu}
            className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            メニューに戻る
          </button>
        </div>
      </div>
    );
  };

  // メインのレンダリング
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl">
        {mode === 'menu' 
          ? renderMenu() 
          : mode === 'results' 
            ? renderResults()
            : renderTypingChallenge()
        }
      </div>
    </div>
  );
};

export default TypingApp;
