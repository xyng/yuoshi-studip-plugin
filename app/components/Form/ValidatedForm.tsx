import React, {
    ComponentProps,
    PropsWithChildren,
    ReactElement,
    useCallback,
    useRef,
} from "react"
import { ObjectSchema, ValidationError } from "yup"
import { Form } from "@unform/web"
import { SubmitHandler, FormHandles } from "@unform/core"

function ValidatedForm<T extends object>(
    props: PropsWithChildren<
        ComponentProps<typeof Form> & {
            validation: ObjectSchema<T>
            onSubmit: SubmitHandler<T>
        }
    >
): ReactElement | null {
    const formRef = useRef<FormHandles>(null)
    const { children, validation, onSubmit, ...rest } = props

    const onValidateSubmit = useCallback(
        async (data, helpers) => {
            const form = formRef.current
            if (!form) {
                return
            }

            // reset validation
            form.setErrors({})

            try {
                const validated = await validation.validate(data, {
                    abortEarly: false,
                    stripUnknown: true,
                })

                // pass only validated data to make sure the user
                // gets exactly what it specified
                onSubmit(validated, helpers)
            } catch (e) {
                if (!(e instanceof ValidationError)) {
                    throw e
                }

                form.setErrors(
                    Object.fromEntries(
                        e.inner.map((error) => [error.path, error.message])
                    )
                )
            }
        },
        [validation, onSubmit]
    )

    return (
        <Form {...rest} ref={formRef} onSubmit={onValidateSubmit}>
            {children}
        </Form>
    )
}

export default ValidatedForm
