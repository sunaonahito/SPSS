import { useState, useEffect } from 'react';
import './App.css';

// 型定義
type Phase =
  | 'title'
  | 'opening1' | 'opening2' | 'opening3'
  | 'stage1' | 'stage2' | 'stage3' | 'stage3_rolling' | 'stage3_losing'
  | 'ending1' | 'ending2' | 'special' | 'thanks';

type CardCategory = 'green' | 'pink' | 'blue' | 'yellow' | 'purple';

interface Card {
  id: string;
  category: CardCategory;
  text: string;
  description?: string;
  isLost: boolean;
}

const CATEGORY_LABELS: Record<CardCategory, string> = {
  green: '物',
  pink: '人',
  blue: '場所',
  yellow: '出来事',
  purple: '目標'
};

const CATEGORY_EXAMPLES: Record<CardCategory, string> = {
  green: 'PC, 携帯など',
  pink: '母, 友人など',
  blue: '自室, 学校など',
  yellow: '合格, 旅行など',
  purple: '就職, 結婚など'
};

function App() {
  const [phase, setPhase] = useState<Phase>('title');

  // ステージ1: カード
  const [cards, setCards] = useState<Card[]>([]);
  const [inputCategory, setInputCategory] = useState<CardCategory>('green');
  const [inputText, setInputText] = useState('');

  // ステージ2: 共有
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [shareText, setShareText] = useState('');

  // Special Stage: 最後のメッセージ
  const [recipientName, setRecipientName] = useState('');
  const [finalMessage, setFinalMessage] = useState('');

  // ステージ3: 喪失
  const [difficulty, setDifficulty] = useState<'EASY' | 'NORMAL' | 'HARD'>('NORMAL');
  const [diceRolls, setDiceRolls] = useState(0); // 振った回数
  const [currentDice, setCurrentDice] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  const [cardsToLose, setCardsToLose] = useState(0);

  // 背景画像のパス
  const bgImage = "url('/assets/背景.png')";

  // --- ハンドラー ---
  const addCard = () => {
    if (!inputText.trim()) return;
    if (cards.length >= 25) {
      alert('カードは最大25枚までです。');
      return;
    }
    const newCard: Card = {
      id: Date.now().toString(),
      category: inputCategory,
      text: inputText,
      isLost: false,
    };
    setCards([...cards, newCard]);
    setInputText('');
  };

  const removeCard = (cardId: string) => {
    setCards(cards.filter(c => c.id !== cardId));
  };

  const rollDice = () => {
    setIsRolling(true);
    setPhase('stage3_rolling');

    // アニメーション用のタイマー
    let rolls = 0;
    const interval = setInterval(() => {
      setCurrentDice(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 15) {
        clearInterval(interval);
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setCurrentDice(finalDice);
        setIsRolling(false);
        setDiceRolls(prev => prev + 1);

        // 喪失枚数の計算
        let loseCount = 0;
        if (difficulty === 'EASY') {
          loseCount = Math.max(1, finalDice - 2);
        } else if (difficulty === 'NORMAL') {
          loseCount = finalDice;
        } else {
          // HARD MODE
          loseCount = finalDice + 2;
        }

        const remainingActiveCards = cards.filter(c => !c.isLost).length;
        loseCount = Math.min(loseCount, remainingActiveCards);

        if (loseCount > 0) {
          setCardsToLose(loseCount);
          setPhase('stage3_losing');
        } else {
          if (remainingActiveCards === 0) {
            setPhase('ending1');
          } else {
            setPhase('stage3');
          }
        }
      }
    }, 100);
  };

  const handleLoseCard = (cardId: string) => {
    if (phase !== 'stage3_losing') return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isLost) return;

    setCards(cards.map(c => c.id === cardId ? { ...c, isLost: true } : c));
    setCardsToLose(prev => prev - 1);
  };

  // 喪失枚数が0になったら状態を戻す
  useEffect(() => {
    if (phase === 'stage3_losing' && cardsToLose <= 0) {
      const remainingActiveCards = cards.filter(c => !c.isLost).length;
      if (remainingActiveCards === 0) {
        setPhase('ending1');
      } else {
        setPhase('stage3');
      }
    }
  }, [cardsToLose, phase, cards]);


  // --- レンダーコンポーネント ---

  const renderTitle = () => (
    <div className="story-screen" style={{ flexDirection: 'column', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', letterSpacing: '0.2rem' }}>The Dice of Destiny</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.8 }}>The Educational Effects of Games about Loss: Focusing on well-being</p>
      <p style={{ fontSize: '1.5rem', marginBottom: '1.5rem', opacity: 0.9 }}>準備ができたら始めましょう</p>
      <button
        className="next-button"
        style={{ fontSize: '2rem', padding: '1.5rem 4rem', borderRadius: '50px', background: 'rgba(138, 43, 226, 0.6)', border: '2px solid white' }}
        onClick={() => setPhase('opening1')}
      >
        体験を始める
      </button>
      <div style={{ marginTop: '2rem', fontSize: '0.85rem', opacity: 0.6, textAlign: 'center', lineHeight: '2' }}>
        このゲームは、喪失体験を通じた自己対話を目的としています。<br />
        ※ 参加と中止は完全に自由です。不快感を感じた場合はいつでも中止できます。
      </div>
    </div>
  );

  const renderOpening = () => {
    let text: string[] = [];
    if (phase === 'opening1') {
      text = [
        "あなたは突然、目の前が真っ暗になった。",
        "目を開けると見たこともない景色だった。奇抜な衣装を身に纏った子どもが視界に入った。",
        "「君の心に話しかけているよ。君はふりょのできごとに見舞われた。もしかしたら、これまでと同じような生活はできないかもしれない。君の大切な物事が全て失われてしまうほどのアクシデントなんだ。」"
      ];
    } else if (phase === 'opening2') {
      text = [
        "「『何を言ってるんだ』と思うのもムリもないよね。でも、信じてほしい。これからけいけんすることは、現実の君の人生にかかわることなんだ。」",
        "「そして君らには『（ダイス・オブ・ディスティニー）』を使う機会が与えられる。」",
        "「いちばんだいじなことだから忘れずにおぼえておいてね。このダイスを投げることで君らの大切な物事を失わずにすむかもしれないんだ。それどころか、君らの人生が今よりもっとよい状態になるかもしれないんだよ。」"
      ];
    } else if (phase === 'opening3') {
      text = [
        "「君は『詳しく説明して欲しい』と思うだろうけど、ゆっくりせつめいしている時間はないんだ。そろそろ始まるから。」",
        "「きいてくれてありがとう。これから大切な物事をカードにするんだ。できるだけ多くね。」",
        "「あ！ マスターの指示はかならずまもってね。かってに行動してはいけないよ。君らの人生が、よりよいものになることを願っているよ。」",
        "そう言い残して子どもは視界から消えていった—"
      ];
    }

    return (
      <div className="story-screen">
        <div className="story-text">
          {text.map((line, i) => <p key={i}>{line}</p>)}
          <button
            className="next-button"
            onClick={() => {
              if (phase === 'opening1') setPhase('opening2');
              else if (phase === 'opening2') setPhase('opening3');
              else setPhase('stage1');
            }}
          >
            次へ
          </button>
        </div>
        <img src="/assets/図1.png" className="character-image" alt="Master" />
      </div>
    );
  };

  const renderStage1 = () => (
    <div className="stage-container">
      <div className="header">
        <h2>1st Stage: 大切なカードの作成</h2>
        <p>あなたの人生で大切な物・人・場所・出来事・目標などを、最低5枚のカードにしてください。</p>
        <p>現在の枚数: {cards.length} / 25</p>
        {cards.length >= 5 && (
          <div style={{ marginTop: '0.5rem' }}>
            <button className="next-button" onClick={() => setPhase('stage2')}>2nd Stageへ進む</button>
          </div>
        )}
      </div>

      <div className="category-buttons">
        {(Object.keys(CATEGORY_LABELS) as CardCategory[]).map(cat => (
          <button
            key={cat}
            className={`category-btn ${cat} ${inputCategory === cat ? 'selected' : ''}`}
            onClick={() => setInputCategory(cat)}
          >
            <span className="category-btn-label">{CATEGORY_LABELS[cat]}</span>
            <span className="category-btn-example">{CATEGORY_EXAMPLES[cat]}</span>
          </button>
        ))}
      </div>

      <div className="card-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="大切なものごとを入力..."
        />
        <button className="btn-add" onClick={addCard}>作成</button>
      </div>

      <div className="cards-grid">
        {cards.map(c => (
          <div key={c.id} className={`card ${c.category}`}>
            <button
              className="card-delete-btn"
              onClick={(e) => { e.stopPropagation(); removeCard(c.id); }}
              title="このカードを削除"
            >×</button>
            <span className="card-category">{CATEGORY_LABELS[c.category]}</span>
            <span className="card-text">{c.text}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStage2 = () => {
    const activeCards = cards.filter(c => !c.isLost);
    return (
      <div className="stage-container">
        <div className="header">
          <h2>2nd Stage: 大切なカードの物語</h2>
          <p>作成したカードから1つ選び、なぜ大切なのかを手紙形式で説明しましょう。</p>
          {activeCards.some(c => c.description) ? (
            <div style={{ marginTop: '0.5rem' }}>
              <button className="next-button" onClick={() => setPhase('stage3')}>3rd Stageへ進む</button>
            </div>
          ) : (
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>※ 最低1つのカードの物語を保存すると次へ進めます</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '2rem', flex: 1 }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div className="cards-grid">
              {activeCards.map(c => {
                const hasDescription = !!c.description;
                return (
                  <div
                    key={c.id}
                    className={`card ${c.category} ${hasDescription ? 'described' : ''}`}
                    style={{
                      transform: selectedCardId === c.id ? 'scale(1.1) translateY(-10px)' : 'none',
                      border: selectedCardId === c.id ? '4px solid white' : hasDescription ? '3px solid rgba(255,255,255,0.5)' : 'none',
                      cursor: hasDescription ? 'default' : 'pointer',
                      opacity: hasDescription ? 0.7 : 1,
                    }}
                    onClick={() => { if (!hasDescription) setSelectedCardId(c.id); }}
                  >
                    {hasDescription && <span className="card-described-badge">記入済み ✓</span>}
                    <span className="card-category">{CATEGORY_LABELS[c.category]}</span>
                    <span className="card-text">{c.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1 }} className="share-area">
            {selectedCardId ? (
              <>
                <h3>選択中のカード: {cards.find(c => c.id === selectedCardId)?.text}</h3>
                <textarea
                  value={shareText}
                  onChange={e => setShareText(e.target.value)}
                  placeholder="伝えたい相手を想像し、関連するエピソードや大切にしている理由を書き記してください..."
                />
                <button className="btn-add" onClick={() => {
                  setCards(cards.map(c => c.id === selectedCardId ? { ...c, description: shareText } : c));
                  setShareText('');
                  setSelectedCardId(null);
                }}>保存する</button>
              </>
            ) : (
              <p>左のカードから一つ選んでください。</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStage3 = () => {
    return (
      <div className="stage-container">
        <div className="header">
          <h2>3rd Stage: 大切なカードの喪失</h2>
          <p>運命のダイスを振るたびに、あなたの大切なものを手放さなければなりません。</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>※モード（難易度）を選択して喪失する枚数を調整しましょう</p>
          <div className="stats">
            <span>残りカード: {cards.filter(c => !c.isLost).length}枚</span>
            <span>ダイスを振った回数: {diceRolls} / 最低4回</span>
          </div>
        </div>

        {phase === 'stage3' && (
          <div className="dice-container">
            <div className="difficulty-buttons">
              <button
                className={`difficulty-btn ${difficulty === 'EASY' ? 'selected' : ''}`}
                onClick={() => setDifficulty('EASY')}
              >
                <span className="difficulty-btn-label">EASY</span>
              </button>
              <button
                className={`difficulty-btn ${difficulty === 'NORMAL' ? 'selected' : ''}`}
                onClick={() => setDifficulty('NORMAL')}
              >
                <span className="difficulty-btn-label">NORMAL</span>
              </button>
              <button
                className={`difficulty-btn ${difficulty === 'HARD' ? 'selected' : ''}`}
                onClick={() => setDifficulty('HARD')}
              >
                <span className="difficulty-btn-label">HARD</span>
              </button>
            </div>
            <p className="difficulty-desc">
              {difficulty === 'EASY' && '出た目−2枚のカードを喪失（最低1枚）'}
              {difficulty === 'NORMAL' && '出た目と同じ枚数のカードを喪失'}
              {difficulty === 'HARD' && '出た目+2枚のカードを喪失'}
            </p>
            <button className="next-button" onClick={rollDice} style={{ fontSize: '1.5rem', padding: '1rem 3rem' }}>
              ダイスを振る
            </button>
          </div>
        )}

        {phase === 'stage3_rolling' && (
          <div className="dice-container">
            <div className={`dice ${isRolling ? 'rolling' : ''}`}>
              {currentDice}
            </div>
            <h3>運命を決定中...</h3>
          </div>
        )}

        {phase === 'stage3_losing' && (
          <div className="dice-container">
            <div className="dice">{currentDice}</div>
            <h3 className="lose-instruction">
              運命により {cardsToLose} 枚のカードを失います。<br />
              失うカードをクリックして選択してください。
            </h3>
          </div>
        )}

        <div className="cards-grid">
          {cards.map(c => (
            <div
              key={c.id}
              className={`card ${c.category} ${c.isLost ? 'lost' : ''}`}
              onClick={() => handleLoseCard(c.id)}
              style={{ cursor: phase === 'stage3_losing' && !c.isLost ? 'crosshair' : 'default' }}
            >
              <span className="card-category">{CATEGORY_LABELS[c.category]}</span>
              <span className="card-text">{c.text}</span>
            </div>
          ))}
        </div>

        {phase === 'stage3' && diceRolls >= 4 && (
          <div style={{ textAlign: 'center', marginTop: 'auto' }}>
            <button className="next-button" onClick={() => setPhase('ending1')}>エンディングへ進む</button>
          </div>
        )}
      </div>
    );
  };

  const renderEnding = () => {
    let text: string[] = [];
    if (phase === 'ending1') {
      text = [
        "いつの間にか、奇抜な衣装を着た子供があなたの隣に立っていました。",
        "「やあ！ 『運命のサイコロ』を使ってみたんだね？」",
        "子供は再び話しかけてきました。",
        "「どのカードが残って、どのカードを失ったの？」",
        "失われたカードを見つめながら、子供は尋ねました。",
        "「この体験は、君にとってどんな意味があった？」"
      ];
    } else if (phase === 'ending2') {
      text = [
        "すべてのダイスを振り終えて、あなたはゆっくりと目を閉じた。すると、マスターの声が聞こえてきた",
        "「人生で手にするすべてのものは、いつか失われる日が来る。誰もが、例外なく、死を迎える時が来るのだ。」",
        "「だが、今この瞬間、お前は生きている。そして、お前が大切に思うものは、お前と共にあるのだ。」",
        "あなたは深く息を吸い込みます。心は穏やかです。そして、人生が以前よりも少し明るく感じられるのです。"
      ];
    }

    return (
      <div className="story-screen">
        <div className="story-text">
          {text.map((line, i) => <p key={i}>{line}</p>)}
          <button
            className="next-button"
            onClick={() => {
              if (phase === 'ending1') setPhase('special');
              else setPhase('thanks');
            }}
          >
            {phase === 'ending1' ? 'Special Stageへ' : '次へ'}
          </button>
        </div>
        <img src={phase === 'ending1' ? "/assets/Master1 2.png" : "/assets/Master2.png"} className="character-image" alt="Character" />
      </div>
    );
  };

  const renderThanks = () => (
    <div className="story-screen" style={{ flexDirection: 'column', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>ご体験ありがとうございました</h1>
      <p style={{ fontSize: '1.2rem', lineHeight: '2', opacity: 0.9 }}>
        「Dice of Destiny」をご体験いただいたことに感謝します。<br />
        この体験が、あなたの日常をより豊かにするきっかけになれば幸いです。
      </p>
    </div>
  );

  const renderSpecial = () => {
    return (
      <div className="stage-container">
        <div className="header">
          <h2>Special Stage: 大切な人へのメッセージ</h2>
          <p>体験を通じて感じたことを、大切な人へのメッセージとして書いてみましょう。</p>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <h3>手元に残ったカード</h3>
            <div className="cards-grid" style={{ zoom: 0.8 }}>
              {cards.filter(c => !c.isLost).map(c => (
                <div key={c.id} className={`card ${c.category}`}>
                  <span className="card-text">{c.text}</span>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: '2rem' }}>あなたが失ったカード</h3>
            <div className="cards-grid" style={{ zoom: 0.8 }}>
              {cards.filter(c => c.isLost).map(c => (
                <div key={c.id} className={`card ${c.category} lost-no-label`}>
                  <span className="card-text">{c.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }} className="share-area">
            <input
              type="text"
              placeholder="メッセージを届けたい人の名前や関係.."
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              style={{ padding: '1rem', fontSize: '1rem', borderRadius: '4px', border: 'none', background: '#f5f5f0', color: '#000', width: '100%', boxSizing: 'border-box' }}
            />
            <textarea
              placeholder="大切な人を想い、メッセージを記します..."
              value={finalMessage}
              onChange={(e) => setFinalMessage(e.target.value)}
            />
            <button className="next-button" onClick={() => setPhase('ending2')}>最後へ</button>
          </div>
        </div>
        <img src="/assets/Master1 2.png" style={{ position: 'absolute', bottom: 0, right: 0, height: '40%', opacity: 0.3 }} alt="Bg" />
      </div>
    );
  };

  return (
    <div className="game-container" style={{ backgroundImage: bgImage }}>
      <div className={`overlay ${phase === 'title' ? 'title-mode' : ''}`}></div>
      <div className="content">
        {phase === 'title' && renderTitle()}
        {phase.startsWith('opening') && renderOpening()}
        {phase === 'stage1' && renderStage1()}
        {phase === 'stage2' && renderStage2()}
        {phase.startsWith('stage3') && renderStage3()}
        {phase === 'special' && renderSpecial()}
        {phase.startsWith('ending') && renderEnding()}
        {phase === 'thanks' && renderThanks()}
      </div>
    </div>
  );
}

export default App;
