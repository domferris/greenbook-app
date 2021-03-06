import React, { useState, useEffect, useRef } from 'react';
import { useStateValue } from "../components/State";
import { View, Text, StyleSheet, Button, Platform, ActivityIndicator, FlatList } from 'react-native';
import { Link } from "../components/Link";
import { PageTitle } from "../components/PageTitle";
import { RichText } from "../components/RichText";
import { getStyles, Theme, getContent, getData } from '../utils';
import styled from 'styled-components';
import { TouchableOpacity } from 'react-native-gesture-handler';


function Page(props) {

    const [{ view, isWeb, dimensions }, dispatch] = useStateValue();
    const styles = StyleSheet.create(getStyles('text_header2, text_header3, button_green, button_green_text, text_header4, section, content', { isWeb }));
    const hiddenStyles = StyleSheet.create({
        hidden: {
            display: 'none',

        },
        shown: {
            display: 'contents',
        },
        grid: {
            display: "grid",
            gridTemplateColumns: '50rem 20rem 20rem'
        }
    })

    const [pageLoading, setPageLoading] = useState(props.content ? false : true);
    const [content, setContent] = useState(props.content || {});
    const [bodyChanged, setBodyChanged] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [loadingRoles, setLoadingRoles] = useState(!props.roles);
    const [errorRoles, setErrorRoles] = useState('');
    const [roles, setRoles] = useState(props.roles || []);


    let state = {}
    roles.forEach((role, index) => {
        state[index] = false;
    })

    const [roleState, setRoleState] = useState(state);
    console.log("ROLES:", roles);

    if (!props.content) {
        useEffect(() => {
            getContent({ type: 'content', uid: 'volunteer' }).then(_content => {
                console.log('_content', _content)
                setContent(_content.content)
                setPageLoading(false);
            }).catch(err => {
                console.error(err);
            });
        }, [])
    }
    useEffect(() => {
        if (!props.roles) {
            getData({
                type: 'roles'
            }).then(_roles => {
                setLoadingRoles(false);
                setRoles(_roles)
            }).catch(err => {
                console.error(err);
                setLoadingRoles(false);
                setErrorRoles('Failed to load roles.');
            })
        }
    }, [])

    let numColumns = dimensions.width < 800 ? 1 : 2

    const heading1 = content._body.value.slice(0, 1);
    const paragraph1 = content._body.value.slice(1, 2);
    const photo = content._body.value.slice(2, 3);

    let newtext = content._body.value[1].text;
    newtext.replace('\n', '');
    let n = newtext.indexOf("Maintaining");
    if (n == 344) {
        newtext = newtext.substring(0, n) + "\n\n" + newtext.substring(n, newtext.length);
        paragraph1[0].text = newtext;
        console.log('CHANGED WENT THROUGH')
    }

    const myRef = useRef(null);
    const executeScroll = () => myRef.current.focus({ behavior: "smooth" })

    return (
        <React.Fragment>
            { pageLoading || loadingRoles ?
                <View style={{ marginTop: 200, marginBottom: 200 }}>
                    <ActivityIndicator color={Theme.green} size="large" />
                </View>
                : (
                    <React.Fragment>
                        <PageTitle title={content.page_title} />
                        <View style={[styles.section, { paddingBottom: 0, paddingRight: "18rem", paddingTop: dimensions.width < 900 ? 40 : 80 }]}>
                            <View style={[styles.content, { marginBottom: "2rem" }]}>
                                <RichText render={heading1} isWeb={isWeb} markupStyle={'fancy'} bullet={'check'} />
                                <RichText render={paragraph1} isWeb={isWeb} markupStyle={'fancy'} bullet={'check'} />
                                <View style={[styles.button_green_text, { width: "50%" }]}>
                                    <Button
                                        nativeID="button"
                                        onPress={executeScroll}
                                        title="Scroll to Volunteer Form"
                                        color="green"
                                        style={styles.button_green_text}
                                    />
                                </View>
                            </View>
                        </View>
                        <View nativeID="div1" style={[styles.section, { paddingTop: 0, alignItems: "flex-start", paddingStart: "18rem" }]}>
                            <View nativeID="div2" style={styles.content}>
                                <View nativeID="flexcontainer" style={isWeb ? hiddenStyles.grid : null}>
                                    <View style={isWeb ? { paddingTop: 60 } : null}>
                                        <RichText render={photo} isWeb={isWeb} markupStyle={'fancy'} bullet={'check'} />
                                    </View>
                                    <View style={isWeb ? { paddingLeft: "2rem", gridColumnStart: "2", gridColumnEnd: "4" } : null}>
                                        <FlatList
                                            nativeID="flatLIST"
                                            key={'cols' + numColumns}
                                            data={roles}
                                            extraData={selectedId}
                                            numColumns={1}
                                            renderItem={({ item, index, separators }) => (
                                                <View
                                                    key={'press' + index}
                                                    style={{
                                                        flex: 1,
                                                        margin: 10,
                                                    }}
                                                >
                                                    <TouchableOpacity onPress={(e) => {
                                                        let state = roleState;
                                                        state[index] = state[index] ? false : true;
                                                        setRoleState(state);

                                                        console.log("INDEX CURRENTLY AT:", index)
                                                        if (selectedId) {
                                                            setSelectedId(0);
                                                        }
                                                        setSelectedId(1)

                                                        // console.log("SET SELECTED INDEX TO:", selectedId)

                                                    }}>
                                                        <Text accessibilityRole="header" aria-level={3} style={[styles.text_header3, { marginTop: 40 }]}>
                                                            {roleState[index] ? '-' : '+'}{' '}{' '}{item.title}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <View style={{
                                                        display: "block",
                                                        marginBefore: "0.5em",
                                                        marginAfter: "0.5em",
                                                        overflow: "hidden",
                                                        borderStyle: "inset",
                                                        borderWidth: "1px",
                                                        width: "100%",
                                                        opacity: .5
                                                    }} />
                                                    <View
                                                        nativeID="hidden"
                                                        style={
                                                            roleState[index] ? hiddenStyles.shown : hiddenStyles.hidden
                                                        }>
                                                        <Text style={[styles.text_body, { marginTop: 10, fontStyle: 'italic' }]}>{item.location}</Text>
                                                        <RichText render={item._description} isWeb={isWeb} markupStyle={'fancy'} bullet={'check'} />
                                                    </View>
                                                </View>
                                            )}
                                            keyExtractor={(item, index) => 'press' + index}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View nativeID="formBelow" style={[styles.section]}>
                            <View style={styles.content}>
                                <View style={[{ flex: 1, backgroundColor: '#000', width: '100%', flexDirection: dimensions.width < 900 ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                                    <View style={{ flex: 3, padding: 20 }}>
                                        <Text style={[styles.text_header4, { color: '#fff' }]}>
                                            The biggest impact we can all have is by getting as many people as possible to patron a business that we have listed.
                                </Text>
                                    </View>
                                    <View style={{ flex: 1, padding: 20, justifyContent: 'flex-end' }}>
                                        <View style={{ flex: 1 }}>
                                            <Link contain href="https://forms.gle/vJ114r7J3JkE8jrs9" title="Volunteer Form">
                                                <View style={[styles.button_green]} >
                                                    <Text style={styles.button_green_text}>Volunteer Form</Text>
                                                </View>
                                            </Link>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View ref={myRef} />
                    </React.Fragment>
                )}
        </React.Fragment>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default Page;

