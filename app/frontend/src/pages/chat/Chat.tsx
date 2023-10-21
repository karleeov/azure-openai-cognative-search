import { useRef, useState, useEffect } from "react";
import { Checkbox, Panel, DefaultButton, TextField, SpinButton, Dropdown, IDropdownOption } from "@fluentui/react";
import { SparkleFilled } from "@fluentui/react-icons";

import styles from "./Chat.module.css";

import { chatApi, RetrievalMode, Approaches, AskResponse, ChatRequest, ChatTurn, ChatMessage, getToken } from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanel, AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { SettingsButton } from "../../components/SettingsButton";
import { ClearChatButton } from "../../components/ClearChatButton";
import Typewriter from "typewriter-effect";

import { useLocation } from "react-router-dom";

const Chat = () => {
    const location = useLocation();

    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [promptTemplate, setPromptTemplate] = useState<string>("");
    const [retrieveCount, setRetrieveCount] = useState<number>(1);
    const [selectedModel, setSelectedModel] = useState<string>("GPT4");
    const [topP, setTopP] = useState<number>(0.95);
    const [retrievalMode, setRetrievalMode] = useState<RetrievalMode>(RetrievalMode.Text);
    const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(false);
    const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
    const [excludeCategory, setExcludeCategory] = useState<string>("");
    const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(false);
    const [selectedConversationStyle, setSelectedConversationStyle] = useState<string>("Precise");
    const [selectedIndex, setSelectedIndex] = useState<string>("HKSTP");

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
    const [answers, setAnswers] = useState<[user: string, response: AskResponse][]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [tokens, setTokens] = useState<number>(0);

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;

        error && setError(undefined);
        setIsLoading(true);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);

        try {
            const history: ChatTurn[] = answers.map(a => ({ user: a[0], bot: a[1].answer }));
            const request: ChatRequest = {
                history: [...history, { user: question, bot: undefined }],
                approach: Approaches.ReadRetrieveRead,
                overrides: {
                    promptTemplate: promptTemplate.length === 0 ? undefined : promptTemplate,
                    excludeCategory: excludeCategory.length === 0 ? undefined : excludeCategory,
                    top: retrieveCount,
                    modeloption: selectedModel,
                    topP: topP,
                    retrievalMode: retrievalMode,
                    semanticRanker: useSemanticRanker,
                    semanticCaptions: useSemanticCaptions,
                    suggestFollowupQuestions: useSuggestFollowupQuestions,
                    conversationstyleoption: selectedConversationStyle,
                    indexoption: selectedIndex,
                    tokenlimit: location.state.tokenlimit
                }
            };
            const result = await chatApi(request);
            setAnswers([...answers, [question, result]]);
            chatHistory.push({ role: "assistant", content: result.answer });
            setChatHistory(chatHistory);
            const totalTokens = await getToken(chatHistory);
            setTokens(totalTokens);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        lastQuestionRef.current = "";
        error && setError(undefined);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);
        setAnswers([]);
        setChatHistory([]);
        setTokens(0);
    };

    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading]);

    const onPromptTemplateChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setPromptTemplate(newValue || "");
    };

    const onRetrieveCountChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setRetrieveCount(parseInt(newValue || "3"));
    };

    const modelRadioHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedModel(event.target.value);
    };

    const onTopPChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setTopP(parseFloat(newValue || "0.95"));
    };

    const onRetrievalModeChange = (_ev: React.FormEvent<HTMLDivElement>, option?: IDropdownOption<RetrievalMode> | undefined, index?: number | undefined) => {
        setRetrievalMode(option?.data || RetrievalMode.Hybrid);
    };

    const onUseSemanticRankerChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticRanker(!!checked);
    };

    const onUseSemanticCaptionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticCaptions(!!checked);
    };

    const onExcludeCategoryChanged = (_ev?: React.FormEvent, newValue?: string) => {
        setExcludeCategory(newValue || "");
    };

    const onUseSuggestFollowupQuestionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSuggestFollowupQuestions(!!checked);
    };

    const radioHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedConversationStyle(event.target.value);
    };

    const indexRadioHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIndex(event.target.value);
    };

    const onExampleClicked = (example: string) => {
        makeApiRequest(example);
    };

    const onShowCitation = (citation: string, index: number) => {
        if (activeCitation === citation && activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveCitation(citation);
            setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab);
        }

        setSelectedAnswer(index);
    };

    const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
        if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveAnalysisPanelTab(tab);
        }

        setSelectedAnswer(index);
    };

    return (
        <div className={styles.container}>
            <div className={styles.commandsContainer}>
                <ClearChatButton className={styles.commandButton} onClick={clearChat} disabled={!lastQuestionRef.current || isLoading} />
                <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
            </div>
            <div className={styles.chatRoot}>
                <div className={styles.chatContainer}>
                    <div className={styles.imageContainer}>
                        <img
                            src="https://media.licdn.com/dms/image/C5603AQGPeAVeitPGiw/profile-displayphoto-shrink_800_800/0/1661323234970?e=2147483647&v=beta&t=p0o1rIe4-el6o_cdO3MzE1RfwVEw6jv3SfgRIMCrNSY"
                            alt=""
                            width={300}
                            height={300}
                        />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/1/13/ChatGPT-Logo.png" alt="" width={250} height={150} />
                    </div>

                    {!lastQuestionRef.current ? (
                        <div className={styles.chatEmptyState}>
                            <h1 className={styles.chatEmptyStateSubtitle}>
                                <Typewriter
                                    options={{
                                        // strings: ["Hello", "Value Partners Group Ltd."],
                                        strings: ["Hello", "Welcom to GTI OpenAI Chatbot"],
                                        autoStart: true,
                                        loop: true
                                    }}
                                />
                            </h1>

                            <h2 className={styles.chatEmptyStateSubtitle}>
                                <Typewriter
                                    options={{
                                        autoStart: false,
                                        cursor: "AZURE OPENAI",
                                        loop: true
                                    }}
                                />
                            </h2>
                            <ExampleList onExampleClicked={onExampleClicked} />
                        </div>
                    ) : (
                        <div className={styles.chatMessageStream}>
                            {answers.map((answer, index) => (
                                <div key={index}>
                                    <UserChatMessage message={answer[0]} />
                                    <div className={styles.chatMessageGpt}>
                                        <Answer
                                            key={index}
                                            answer={answer[1]}
                                            isSelected={selectedAnswer === index && activeAnalysisPanelTab !== undefined}
                                            onCitationClicked={c => onShowCitation(c, index)}
                                            onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab, index)}
                                            onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                                            onFollowupQuestionClicked={q => makeApiRequest(q)}
                                            showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
                                            token={tokens}
                                        />
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <>
                                    <UserChatMessage message={lastQuestionRef.current} />
                                    <div className={styles.chatMessageGptMinWidth}>
                                        <AnswerLoading />
                                    </div>
                                </>
                            )}
                            {error ? (
                                <>
                                    <UserChatMessage message={lastQuestionRef.current} />
                                    <div className={styles.chatMessageGptMinWidth}>
                                        <AnswerError error={error.toString()} onRetry={() => makeApiRequest(lastQuestionRef.current)} />
                                    </div>
                                </>
                            ) : null}
                            <div ref={chatMessageStreamEnd} />
                        </div>
                    )}

                    <div className={styles.chatInput}>
                        <QuestionInput clearOnSend placeholder="Ask me something" disabled={isLoading} onSend={question => makeApiRequest(question)} />
                    </div>

                    <div>
                        {location.state.usedtoken}/{location.state.tokenlimit}
                    </div>
                </div>

                {answers.length > 0 && activeAnalysisPanelTab && (
                    <AnalysisPanel
                        className={styles.chatAnalysisPanel}
                        activeCitation={activeCitation}
                        onActiveTabChanged={x => onToggleTab(x, selectedAnswer)}
                        citationHeight="810px"
                        answer={answers[selectedAnswer][1]}
                        activeTab={activeAnalysisPanelTab}
                    />
                )}

                <Panel
                    headerText="Configure answer generation"
                    isOpen={isConfigPanelOpen}
                    isBlocking={false}
                    onDismiss={() => setIsConfigPanelOpen(false)}
                    closeButtonAriaLabel="Close"
                    onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
                    isFooterAtBottom={true}
                >
                    <TextField
                        className={styles.chatSettingsSeparator}
                        defaultValue={promptTemplate}
                        label="Override prompt template"
                        multiline
                        autoAdjustHeight
                        onChange={onPromptTemplateChange}
                    />

                    <SpinButton
                        className={styles.chatSettingsSeparator}
                        label="Retrieve this many documents from search:"
                        min={1}
                        max={50}
                        defaultValue={retrieveCount.toString()}
                        onChange={onRetrieveCountChange}
                    />
                    <TextField className={styles.chatSettingsSeparator} label="Exclude category" onChange={onExcludeCategoryChanged} />
                    <Checkbox
                        className={styles.chatSettingsSeparator}
                        checked={useSemanticRanker}
                        label="Use semantic ranker for retrieval"
                        onChange={onUseSemanticRankerChange}
                    />
                    <Checkbox
                        className={styles.chatSettingsSeparator}
                        checked={useSemanticCaptions}
                        label="Use query-contextual summaries instead of whole documents"
                        onChange={onUseSemanticCaptionsChange}
                        disabled={!useSemanticRanker}
                    />
                    <Checkbox
                        className={styles.chatSettingsSeparator}
                        checked={useSuggestFollowupQuestions}
                        label="Suggest follow-up questions"
                        onChange={onUseSuggestFollowupQuestionsChange}
                    />
                    <div className="container">
                        <fieldset>
                            <legend>Please select your conversation style</legend>
                            <p>
                                <input
                                    type="radio"
                                    name="conversation style"
                                    value="Creative"
                                    id="creative"
                                    onChange={radioHandler}
                                    checked={selectedConversationStyle == "Creative"}
                                />
                                <label htmlFor="csop">More Creative</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    name="conversation style"
                                    value="Balance"
                                    id="balance"
                                    onChange={radioHandler}
                                    checked={selectedConversationStyle == "Balance"}
                                />
                                <label htmlFor="gammon">More Balance</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    name="conversation style"
                                    value="Precise"
                                    id="precise"
                                    onChange={radioHandler}
                                    checked={selectedConversationStyle == "Precise"}
                                />
                                <label htmlFor="gammon">More Precise</label>
                            </p>
                        </fieldset>
                    </div>
                    <div className="container">
                        <fieldset>
                            <legend>Please select an openai model</legend>
                            <p>
                                <input type="radio" name="model" value="GPT3.5" id="gpt3.5" onChange={modelRadioHandler} checked={selectedModel == "GPT3.5"} />
                                <label htmlFor="GPT3.5">GPT 3.5</label>
                            </p>
                            <p>
                                <input type="radio" name="model" value="GPT4" id="gpt4" onChange={modelRadioHandler} checked={selectedModel == "GPT4"} />
                                <label htmlFor="GPT4">GPT 4</label>
                            </p>
                        </fieldset>
                    </div>
                    <SpinButton
                        className={styles.chatSettingsSeparator}
                        label="Top P"
                        min={0}
                        max={1}
                        step={0.05}
                        defaultValue={topP.toString()}
                        onChange={onTopPChange}
                    />
                    <Dropdown
                        className={styles.chatSettingsSeparator}
                        label="Retrieval mode"
                        options={[
                            { key: "hybrid", text: "Vectors + Text (Hybrid)", selected: retrievalMode == RetrievalMode.Hybrid, data: RetrievalMode.Hybrid },
                            { key: "vectors", text: "Vectors", selected: retrievalMode == RetrievalMode.Vectors, data: RetrievalMode.Vectors },
                            { key: "text", text: "Text", selected: retrievalMode == RetrievalMode.Text, data: RetrievalMode.Text }
                        ]}
                        required
                        onChange={onRetrievalModeChange}
                    />
                    <div className="container">
                        <fieldset>
                            <legend>Please select index of your group</legend>
                            <p>
                                <input type="radio" name="index" value="TC1" id="tc1" onChange={indexRadioHandler} checked={selectedIndex == "TC1"} />
                                <label htmlFor="TC1">Test Case 1</label>
                            </p>
                            <p>
                                <input type="radio" name="index" value="TC2" id="tc2" onChange={indexRadioHandler} checked={selectedIndex == "TC2"} />
                                <label htmlFor="TC2">Test Case 2</label>
                            </p>
                            <p>
                                <input type="radio" name="index" value="TC3" id="tc3" onChange={indexRadioHandler} checked={selectedIndex == "TC3"} />
                                <label htmlFor="TC3">Test Case 3</label>
                            </p>
                            <p>
                                <input type="radio" name="index" value="TC4" id="tc4" onChange={indexRadioHandler} checked={selectedIndex == "TC4"} />
                                <label htmlFor="TC4">Test Case 4</label>
                            </p>
                            <p>
                                <input type="radio" name="index" value="TC5" id="tc5" onChange={indexRadioHandler} checked={selectedIndex == "TC5"} />
                                <label htmlFor="TC5">Test Case 5</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    name="index"
                                    value="Skillset"
                                    id="skillset"
                                    onChange={indexRadioHandler}
                                    checked={selectedIndex == "Skillset"}
                                />
                                <label htmlFor="Skillset">Testing Skillset</label>
                            </p>
                            <p>
                                <input type="radio" name="index" value="CTF" id="ctf" onChange={indexRadioHandler} checked={selectedIndex == "CTF"} />
                                <label htmlFor="CTF">CTF</label>
                            </p>
                            <p>
                                <input type="radio" name="index" value="HKSTP" id="hkstp" onChange={indexRadioHandler} checked={selectedIndex == "HKSTP"} />
                                <label htmlFor="HKSTP">HKSTP</label>
                            </p>
                            {/* <p>
                                <input type="radio" name="index" value="HKHS" id="hkhs" onChange={indexRadioHandler} checked={selectedIndex == "HKHS"} />
                                <label htmlFor="HKHS">H</label>
                            </p> */}
                        </fieldset>
                    </div>
                </Panel>
            </div>
        </div>
    );
};

export default Chat;
