import React, {
    ComponentProps,
    PropsWithChildren,
    ReactElement,
    useCallback,
    useRef,
    useState,
} from "react"
import { ObjectSchema, ValidationError } from "yup"
import { Form } from "@unform/web"
import { SubmitHandler, FormHandles } from "@unform/core"

import Alert from "../Alert/Alert"
import { CenterSpinner } from "../Spinner/Spinner"

import Styles from "./ValidatedForm.module.css"

function ValidatedForm<T extends object>(
    props: PropsWithChildren<
        ComponentProps<typeof Form> & {
            validation: ObjectSchema<T>
            onSubmit: SubmitHandler<T>
            successMessage?: string
            errorMessage?: string
        }
    >
): ReactElement | null {
    const {
        children,
        validation,
        onSubmit,
        className,
        successMessage,
        errorMessage,
        ...rest
    } = props

    const formRef = useRef<FormHandles>(null)

    const [hasError, setHasError] = useState(false)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState<boolean | undefined>(undefined)

    const onValidateSubmit = useCallback(
        async (data, helpers) => {
            if (saving) {
                return
            }

            setSaving(true)
            setSuccess(undefined)
            const form = formRef.current
            if (!form) {
                return
            }

            // reset validation
            form.setErrors({})
            setHasError(false)

            try {
                const validated = await validation.validate(data, {
                    abortEarly: false,
                    stripUnknown: true,
                })

                // pass only validated data to make sure the user
                // gets exactly what it specified
                await onSubmit(validated, helpers)

                setSaving(false)
                setSuccess(true)
            } catch (e) {
                setSaving(false)

                if (!(e instanceof ValidationError)) {
                    setSuccess(false)

                    return
                }

                form.setErrors(
                    Object.fromEntries(
                        e.inner.map((error) => [error.path, error.message])
                    )
                )

                setHasError(true)
            }
        },
        [validation, onSubmit, saving]
    )

    return (
        <Form
            className={`${Styles.form} ${className || ""}`}
            {...rest}
            ref={formRef}
            onSubmit={onValidateSubmit}
        >
            {hasError && (
                <Alert label="Fehler." appearance="error">
                    Dieses Formular ist nicht korrekt oder nicht vollständig
                    ausgefüllt. Bitte überprüfen Sie Ihre Angaben.
                </Alert>
            )}
            {saving && (
                <div className={Styles.saving}>
                    <CenterSpinner />
                </div>
            )}
            {success === true && (
                <Alert label="Erfolg." appearance="success">
                    {successMessage && <span>{successMessage}</span>}
                    {!successMessage && (
                        <span>Das Speichern war erfolgreich.</span>
                    )}
                </Alert>
            )}
            {success === false && (
                <Alert label="Fehler." appearance="error">
                    {errorMessage && <span>{errorMessage}</span>}
                    {!errorMessage && (
                        <span>Ein unerwarteter Fehler ist aufgetreten.</span>
                    )}
                </Alert>
            )}
            {children}
        </Form>
    )
}

export default ValidatedForm
